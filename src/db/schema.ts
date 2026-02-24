import { pgTable, text, timestamp, uuid, pgEnum, index } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["ACADEMY", "STUDENT"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().default("User"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pdfs = pgTable("pdfs", {
  id: uuid("id").primaryKey().defaultRandom(),
  academyId: uuid("academy_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  fileUrl: text("file_url").notNull(),
  subjectName: text("subject_name").notNull(),
  className: text("class_name").notNull(),
  schoolName: text("school_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("subject_idx").on(table.subjectName),
    index("class_idx").on(table.className),
    index("school_idx").on(table.schoolName),
  ];
});
