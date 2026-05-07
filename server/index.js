import "dotenv/config";
import express    from "express";
import cors       from "cors";
import mongoose   from "mongoose";
import { Progress } from "./models/Progress.js";

/* ── Config ──────────────────────────────────────────────────────── */
const PORT      = process.env.PORT      || 3001;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/word-garden";

/* ── Express setup ───────────────────────────────────────────────── */
const app = express();
app.use(cors());
app.use(express.json());

/* ── MongoDB connection ──────────────────────────────────────────── */
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅  MongoDB connected →", MONGO_URI))
  .catch(err => console.error("❌  MongoDB error:", err.message));

/* ── Health check ────────────────────────────────────────────────── */
app.get("/api/health", (_req, res) => res.json({ ok: true }));

/* ── GET /api/progress/:userId ───────────────────────────────────── */
app.get("/api/progress/:userId", async (req, res) => {
  try {
    const doc = await Progress.findOne({ userId: req.params.userId });
    // Return null (not 404) so the client can detect "no record yet"
    res.json(doc ? doc.data : null);
  } catch (err) {
    console.error("GET progress error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ── PUT /api/progress/:userId  (upsert) ─────────────────────────── */
app.put("/api/progress/:userId", async (req, res) => {
  try {
    const doc = await Progress.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { data: req.body } },
      { upsert: true, new: true, runValidators: true }
    );
    res.json(doc.data);
  } catch (err) {
    console.error("PUT progress error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ── Start ───────────────────────────────────────────────────────── */
app.listen(PORT, () =>
  console.log(`🌱  Word Garden API  →  http://localhost:${PORT}`)
);
