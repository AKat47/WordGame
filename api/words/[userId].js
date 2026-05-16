import { connectDB }  from "../_db.js";
import { UserWords }  from "../../server/models/UserWords.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await connectDB();
    const { userId } = req.query;

    if (req.method === "GET") {
      const doc = await UserWords.findOne({ userId });
      return res.json(doc ? doc.words : []);
    }

    if (req.method === "PUT") {
      const doc = await UserWords.findOneAndUpdate(
        { userId },
        { $set: { words: req.body } },
        { upsert: true, new: true, runValidators: true }
      );
      return res.json(doc.words);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("words handler error:", err);
    res.status(500).json({ error: err.message });
  }
}
