import express from "express";
import cors from "cors";

import userAuthApp from "./user-authentication/server.js";
import clientApp from "./client-service/server.js";
import llmApp from "./llm-driven-booking/server.js";

const app = express();

const allowedOrigins = [
  "https://tiger-tix-lovat.vercel.app",
  "https://tiger-phpcq9mdn-jonah-colestocks-projects.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.endsWith(".vercel.app") || origin === "https://tiger-tix-lovat.vercel.app") {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"), false);
  },
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
