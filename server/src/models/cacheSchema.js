import mongoose from "mongoose";

const newsItemSchema = new mongoose.Schema({
  link: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  article: {
    type: String,
  },
});

const cacheSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
  },
  news: [newsItemSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const CacheSchema = mongoose.model("CacheSchema", cacheSchema);
