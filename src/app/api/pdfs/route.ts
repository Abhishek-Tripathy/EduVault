import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/db";
import { pdfs, users } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { Redis } from "@upstash/redis";
import { eq, ilike, and, desc } from "drizzle-orm";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== "ACADEMY") {
      return NextResponse.json({ error: "Forbidden. Only Academy users can upload." }, { status: 403 });
    }

    // 2. Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const subjectName = formData.get("subjectName") as string;
    const className = formData.get("className") as string;
    const schoolName = formData.get("schoolName") as string;

    if (!file || !subjectName || !className || !schoolName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // 3. Upload to Vercel Blob
    const blob = await put(`pdfs/${Date.now()}-${file.name}`, file, {
      access: "public",
      multipart: true,
    });

    // 4. Save metadata to Neon DB
    const [insertedPdf] = await db.insert(pdfs).values({
      academyId: user.userId,
      fileUrl: blob.url,
      subjectName: subjectName.toLowerCase().trim(),
      className: className.toLowerCase().trim(),
      schoolName: schoolName.toLowerCase().trim(),
    }).returning();

    // 5. Invalidate Redis Caches
    // Since student search might be cached by wildcards or specific keys 
    // e.g. "pdfs:search:*"
    try {
      // Use scan or keys to find all search caches and delete them
      // NOTE: KEYS is fine for small datasets, for larger use pattern scanning
      const keys = await redis.keys("pdfs:search:*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (redisError) {
      console.warn("Could not clear Redis cache:", redisError);
      // We don't fail the request if cache clearing fails
    }

    return NextResponse.json({ message: "Upload successful", data: insertedPdf }, { status: 201 });
  } catch (error) {
    console.error("PDF upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Students and Academies can both search/view
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject")?.toLowerCase().trim() || "";
    const className = searchParams.get("class")?.toLowerCase().trim() || "";
    const school = searchParams.get("school")?.toLowerCase().trim() || "";

    // 2. Cache Logic
    const cacheKey = `pdfs:search:${subject || "all"}:${className || "all"}:${school || "all"}`;
    
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return NextResponse.json({ data: cachedData, source: "cache" }, { status: 200 });
      }
    } catch (redisError) {
      console.warn("Redis GET error:", redisError);
      // Fallback to DB if Redis fails
    }

    // 3. Query DB
    const conditions = [];
    if (subject) conditions.push(ilike(pdfs.subjectName, `%${subject}%`));
    if (className) conditions.push(ilike(pdfs.className, `%${className}%`));
    if (school) conditions.push(ilike(pdfs.schoolName, `%${school}%`));

    const results = await db.select({
      id: pdfs.id,
      fileUrl: pdfs.fileUrl,
      subjectName: pdfs.subjectName,
      className: pdfs.className,
      schoolName: pdfs.schoolName,
      createdAt: pdfs.createdAt,
      academyId: pdfs.academyId,
      academyEmail: users.email,
    })
    .from(pdfs)
    .leftJoin(users, eq(pdfs.academyId, users.id))
    .where(and(...conditions))
    .orderBy(desc(pdfs.createdAt));

    // 4. Save to Cache
    try {
      await redis.set(cacheKey, JSON.stringify(results), { ex: 3600 }); // Cache for 1 hour
    } catch (redisError) {
      console.warn("Redis SET error:", redisError);
    }

    return NextResponse.json({ data: results, source: "database" }, { status: 200 });
  } catch (error) {
    console.error("PDF fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
