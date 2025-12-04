import express from "express";
import cors from "cors";

import userAuthApp from "./user-authentication/server.js";
import clientApp from "./client-service/server.js";
import llmApp from "./llm-driven-booking/server.js";

const app = express();

app.use(cors({
  origin: ["https://tiger-tix-lovat.vercel.app/"],
  credentials: true
}));

app.use(express.json());

app.use("/auth", userAuthApp);
app.use("/client", clientApp);
app.use("/llm", llmApp);

app.get("/", (req, res) => {
  res.send("TigerTix backend is running");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Unified backend running on port ${PORT}`);
});
