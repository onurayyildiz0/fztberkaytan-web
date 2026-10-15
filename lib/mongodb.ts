import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // Geliştirme ortamında hot-reload sırasında bağlantının tekrar tekrar açılmasını önler
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI ortam değişkeni tanımlı değil (.env.local dosyasını kontrol edin).");
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || "fizyoterapi",
      bufferCommands: false,
      serverSelectionTimeoutMS: 10_000,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}
