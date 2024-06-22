import express from "express";
import cors from "cors";

import { connectDb } from "./config/db.js";
import router from "./routes/index.routes.js";
import { PORT } from "./config/config.js";

export const app = express();
connectDb();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Ubiquiti API" });
});
app.use("/api/v1", router);
app.set("port", PORT);
