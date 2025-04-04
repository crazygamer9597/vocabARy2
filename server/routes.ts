import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLearnedWordSchema, type InsertLearnedWord } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all available languages
  app.get("/api/languages", async (req, res) => {
    try {
      const languages = await storage.getLanguages();
      res.json({ languages });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch languages" });
    }
  });

  // Get user score
  app.get("/api/users/:userId/score", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const userScore = await storage.getUserScore(userId);
      if (!userScore) {
        return res.status(404).json({ message: "User score not found" });
      }

      res.json({ userScore });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user score" });
    }
  });

  // Get learned words for a user
  app.get("/api/users/:userId/words", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const learnedWords = await storage.getLearnedWords(userId);
      res.json({ learnedWords });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch learned words" });
    }
  });

  // Add a learned word and update score
  app.post("/api/users/:userId/words", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Validate request body
      const wordData: InsertLearnedWord = {
        ...req.body,
        userId,
        learnedAt: new Date().toISOString(),
      };

      const validatedData = insertLearnedWordSchema.parse(wordData);
      const learnedWord = await storage.addLearnedWord(validatedData);
      
      // Award 10 points for each new word learned
      const updatedScore = await storage.incrementUserScore(userId, 10);
      
      res.json({ 
        success: true, 
        learnedWord, 
        score: updatedScore.score, 
        level: updatedScore.level 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid word data", error: error.errors });
      }
      res.status(500).json({ message: "Failed to add learned word" });
    }
  });

  // Create a user (for demo purposes)
  app.post("/api/users", async (req, res) => {
    try {
      const userData = {
        username: req.body.username,
        password: req.body.password,
      };

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({ 
        user: userWithoutPassword,
        message: "User created successfully"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
