import express from "express";
import cors from "cors";
import userAuthRoutes from "./routes/userAuthRoutes.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/", userAuthRoutes);

export default app;
