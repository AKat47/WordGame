import mongoose from "mongoose";

/* ── Cached connection (reused across warm invocations) ───────────── */
let conn = null;

export async function connectDB() {
  if (conn && mongoose.connection.readyState === 1) return conn;
  conn = await mongoose.connect(process.env.MONGODB_URI);
  return conn;
}
