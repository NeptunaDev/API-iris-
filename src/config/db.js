import mongoose from "mongoose";
import { URI_DB_MONGO } from "./config.js"

export const connectDb = async () => {
  try {
    const db = await mongoose.connect(URI_DB_MONGO);
    console.log(`Database connected: ${db.connection.name}`);
  } catch (error) {
    console.log(error.message);
  }
};
