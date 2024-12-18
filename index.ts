import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/dotenv";
import scoreRoutes from "./routes/scoreRoutes";

dotenv.config();

// Connect to MongoDB
connectDB();

const app: Application = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/api/scores", scoreRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
