import mongoose from "mongoose";

const userWordsSchema = new mongoose.Schema(
  {
    userId: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },
    words: {
      // Array of { word, meaning, sentence, image } objects
      type:    [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { timestamps: true }
);

export const UserWords = mongoose.model("UserWords", userWordsSchema);
