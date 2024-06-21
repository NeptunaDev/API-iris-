import express from "express";

import { connectDb } from "./config/db.js";
import router from "./routes/index.routes.js";

export const app = express();
connectDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Ubiquiti API" });
});
app.use("/api/v1", router);
app.set("port", 8000);
