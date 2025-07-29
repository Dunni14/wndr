// src/routes/auth.ts

import express from "express";
import client from "../twilio";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

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

// Signup endpoint
router.post("/signup", async (req, res) => {
  const { phone, firstName, lastName, email } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this phone number" });
    }

    // Store signup data temporarily (we'll create the user after OTP verification)
    // For now, we'll send the OTP and store the data in memory or session
    // In a production app, you might want to use Redis or a temporary table
    
    // Send OTP
    await client.verify.v2.services(process.env.TWILIO_SERVICE_SID!)
      .verifications.create({ to: phone, channel: "sms" });

    res.json({ 
      message: "OTP sent",
      signupData: { phone, firstName, lastName, email } // We'll use this during verification
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { phone, code, signupData } = req.body;

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
      // If signup data is provided, create user with full information
      if (signupData) {
        const fullName = `${signupData.firstName} ${signupData.lastName}`.trim();
        user = await prisma.user.create({
          data: { 
            phone,
            name: fullName,
            email: signupData.email
          }
        });
      } else {
        // Regular login for existing users
        user = await prisma.user.create({
          data: { phone }
        });
      }
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

// Update user profile
router.put("/profile", authenticateToken, async (req: any, res) => {
  const { name, email } = req.body;
  const userId = req.user.userId;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined,
      }
    });

    res.json({ 
      message: "Profile updated successfully",
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Get user's memories
router.get("/memories", authenticateToken, async (req: any, res) => {
  const userId = req.user.userId;

  try {
    const memories = await prisma.memory.findMany({
      where: { userId },
      orderBy: { visitDate: 'desc' }
    });

    res.json({ memories });
  } catch (error) {
    console.error("Error fetching memories:", error);
    res.status(500).json({ error: "Failed to fetch memories" });
  }
});

// Create a new memory
router.post("/memories", authenticateToken, async (req: any, res) => {
  const { title, description, mood, latitude, longitude, imageUrl, visitDate } = req.body;
  const userId = req.user.userId;

  try {
    const memory = await prisma.memory.create({
      data: {
        title,
        description,
        mood,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        imageUrl,
        visitDate: new Date(visitDate),
        userId
      }
    });

    res.json({ 
      message: "Memory created successfully",
      memory 
    });
  } catch (error) {
    console.error("Error creating memory:", error);
    res.status(500).json({ error: "Failed to create memory" });
  }
});

// Update a memory
router.put("/memories/:id", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { title, description, mood, imageUrl, visitDate } = req.body;
  const userId = req.user.userId;

  try {
    // Check if memory belongs to user
    const existingMemory = await prisma.memory.findUnique({
      where: { id },
    });

    if (!existingMemory) {
      return res.status(404).json({ error: "Memory not found" });
    }

    if (existingMemory.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to edit this memory" });
    }

    const updatedMemory = await prisma.memory.update({
      where: { id },
      data: {
        title,
        description,
        mood,
        imageUrl,
        visitDate: visitDate ? new Date(visitDate) : undefined,
      }
    });

    res.json({ 
      message: "Memory updated successfully",
      memory: updatedMemory 
    });
  } catch (error) {
    console.error("Error updating memory:", error);
    res.status(500).json({ error: "Failed to update memory" });
  }
});

// Delete a memory
router.delete("/memories/:id", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    // Check if memory belongs to user
    const existingMemory = await prisma.memory.findUnique({
      where: { id },
    });

    if (!existingMemory) {
      return res.status(404).json({ error: "Memory not found" });
    }

    if (existingMemory.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this memory" });
    }

    await prisma.memory.delete({
      where: { id }
    });

    res.json({ message: "Memory deleted successfully" });
  } catch (error) {
    console.error("Error deleting memory:", error);
    res.status(500).json({ error: "Failed to delete memory" });
  }
});

export default router;
 