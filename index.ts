import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/dotenv";
import authRoutes from "./routes/authRoute";

dotenv.config();
connectDB();

const app: Application = express();

app.use(
  cors({
    origin: "http://192.168.2.134:8081",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());
app.use("/api/auth", authRoutes);
console.log("ENV loaded:", {
  JWT_SECRET: process.env.JWT_SECRET,
  MONGODB_URI: process.env.MONGODB_URI,
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
