import express from "express";
import cors from "cors";
import clientRoutes from "./routes/clientRoutes.js";

const app = express();

const allowedOrigins = [
  "https://tiger-tix-lovat.vercel.app",
  "https://tiger-phpcq9mdn-jonah-colestocks-projects.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!allowedOrigins.includes(origin)) return callback(new Error("Not allowed by CORS"), false);
    return callback(null, true);
  },
  credentials: true
}));

app.options(/.*/, cors());

app.use(express.json());
app.use("/api", clientRoutes);

export default app;
