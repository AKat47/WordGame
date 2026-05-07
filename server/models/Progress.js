import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },
    data: {
      // Stores the full progress blob:
      // { xp, gems, streak, lastPlayedDate, gameStats: { … } }
      type:     mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }   // adds createdAt / updatedAt automatically
);

export const Progress = mongoose.model("Progress", progressSchema);
