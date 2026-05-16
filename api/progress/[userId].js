import { connectDB } from "../_db.js";
import { Progress }  from "../../server/models/Progress.js";

export default async function handler(req, res) {
  // CORS headers (in case called from a different origin)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await connectDB();
    const { userId } = req.query;

    if (req.method === "GET") {
      const doc = await Progress.findOne({ userId });
      return res.json(doc ? doc.data : null);
    }

    if (req.method === "PUT") {
      const doc = await Progress.findOneAndUpdate(
        { userId },
        { $set: { data: req.body } },
        { upsert: true, new: true, runValidators: true }
      );
      return res.json(doc.data);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("progress handler error:", err);
    res.status(500).json({ error: err.message });
  }
}
