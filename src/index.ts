// src/index.ts

import dotenv from "dotenv";
dotenv.config();
import express from "express";
import authRoutes from "./routes/auth";
import cors from "cors";


const app = express();
const PORT = process.env.PORT || 3001;

// Increase payload limits for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({ 
  origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Routes
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to WNDR backend");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
