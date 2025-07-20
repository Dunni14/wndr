// src/routes/auth.ts

import express from "express";
import client from "../twilio";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();

// Send OTP
router.post("/request-otp", async (req, res) => {
  const { phone } = req.body;
  try {
    await client.verify.v2.services(process.env.TWILIO_SERVICE_SID!)
      .verifications.create({ to: phone, channel: "sms" });

    res.json({ message: "OTP sent" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { phone, code } = req.body;

  // Debug log for SERVICE SID
  console.log("SERVICE SID:", process.env.TWILIO_SERVICE_SID);

  try {
    const verification = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID!)
      .verificationChecks
      .create({ to: phone, code });

    if (verification.status !== "approved") {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // User exists?
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({
        data: { phone }
      });
    }

    // JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    console.log("OTP verified successfully for", phone);
    res.json({ token, user });

  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

export default router;
