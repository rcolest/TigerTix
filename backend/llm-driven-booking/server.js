import express from "express";
import cors from "cors";
import llmRoutes from "./routes/llmRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/llm", llmRoutes);

const PORT = 7001;
app.listen(PORT, () => console.log(`✅ LLM service running on port ${PORT}`));
