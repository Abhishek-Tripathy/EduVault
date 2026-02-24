import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db";
import { Pdf, User } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== "ACADEMY") {
      return NextResponse.json({ error: "Forbidden. Only Academy users can upload." }, { status: 403 });
    }

    const body = await req.json();
    const { fileUrl, subjectName, className, schoolName } = body;

    if (!fileUrl || !subjectName || !className || !schoolName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const insertedPdf = await Pdf.create({
      academyId: user.userId,
      fileUrl,
      subjectName: subjectName.toLowerCase().trim(),
      className: className.toLowerCase().trim(),
      schoolName: schoolName.toLowerCase().trim(),
    });

    try {
      const keys = await redis.keys("pdfs:search:*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (redisError) {
      console.warn("Could not clear Redis cache:", redisError);
    }

    return NextResponse.json({ message: "Upload successful", data: insertedPdf }, { status: 201 });
  } catch (error) {
    console.error("PDF upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject")?.toLowerCase().trim() || "";
    const className = searchParams.get("class")?.toLowerCase().trim() || "";
    const school = searchParams.get("school")?.toLowerCase().trim() || "";
    const mine = searchParams.get("mine") === "true";

    const isPersonalQuery = mine && user.role === "ACADEMY";

    const cacheKey = `pdfs:search:${subject || "all"}:${className || "all"}:${school || "all"}`;
    
    if (!isPersonalQuery) {
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          return NextResponse.json({ data: cachedData, source: "cache" }, { status: 200 });
        }
      } catch (redisError) {
        console.warn("Redis GET error:", redisError);
      }
    }

    await connectDB();

    const query: Record<string, unknown> = {};
    if (subject) query.subjectName = { $regex: subject, $options: "i" };
    if (className) query.className = { $regex: className, $options: "i" };
    if (school) query.schoolName = { $regex: school, $options: "i" };
    if (isPersonalQuery) query.academyId = user.userId;

    const pdfs = await Pdf.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const academyIds = [...new Set(pdfs.map((p: any) => p.academyId?.toString()))];
    const academyUsers = await User.find({ _id: { $in: academyIds } }).select("email").lean();
    const emailMap: Record<string, string> = {};
    academyUsers.forEach((u: any) => {
      emailMap[u._id.toString()] = u.email;
    });

    const results = pdfs.map((pdf: any) => ({
      id: pdf._id.toString(),
      fileUrl: pdf.fileUrl,
      subjectName: pdf.subjectName,
      className: pdf.className,
      schoolName: pdf.schoolName,
      createdAt: pdf.createdAt,
      academyId: pdf.academyId?.toString(),
      academyEmail: emailMap[pdf.academyId?.toString()] || "Unknown",
    }));

    if (!isPersonalQuery) {
      try {
        await redis.set(cacheKey, JSON.stringify(results), { ex: 3600 });
      } catch (redisError) {
        console.warn("Redis SET error:", redisError);
      }
    }

    return NextResponse.json({ data: results, source: "database" }, { status: 200 });
  } catch (error) {
    console.error("PDF fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
