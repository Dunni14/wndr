// src/index.ts

import dotenv from "dotenv";
dotenv.config();
import express from "express";
import authRoutes from "./routes/auth";
import cors from "cors";


const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({ origin: "*" }));

// Routes
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to WNDR backend");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
