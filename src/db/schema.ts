import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true, default: "User" },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["ACADEMY", "STUDENT"], required: true },
  createdAt: { type: Date, default: Date.now },
});

const PdfSchema = new Schema({
  academyId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  fileUrl: { type: String, required: true },
  subjectName: { type: String, required: true, index: true },
  className: { type: String, required: true, index: true },
  schoolName: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

export const User = models.User || model("User", UserSchema);
export const Pdf = models.Pdf || model("Pdf", PdfSchema);
