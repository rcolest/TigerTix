import express from "express";
import cors from "cors";
import llmRoutes from "./routes/llmRoutes.js";

const app = express();
app.use(cors({
  origin: ["https://tiger-tix-lovat.vercel.app/"],
  credentials: true
}));
app.use(express.json());

app.use("/api/llm", llmRoutes);

export default app;
