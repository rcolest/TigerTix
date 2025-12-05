import express from "express";
import cors from "cors";
import llmRoutes from "./routes/llmRoutes.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/", llmRoutes);

export default app;
