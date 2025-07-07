import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected to ${conn.connection.name} at ${conn.connection.host}:${conn.connection.port}`);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // exit to let nodemon restart if needed
  }
};
