import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertLearnedWordSchema, type InsertLearnedWord,
  insertVocabularyListSchema, type InsertVocabularyList,
  insertVocabularyListWordSchema, type InsertVocabularyListWord 
} from "@shared/schema";
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

  // Get all learned words for a user
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
      
      // Check if the word was already learned (recap)
      const existingWords = await storage.getLearnedWords(userId);
      const isRecap = existingWords.some(
        word => word.word.toLowerCase() === validatedData.word.toLowerCase()
      );
      
      // Add the word to the learned words list
      const learnedWord = await storage.addLearnedWord(validatedData);
      
      // Award 10 points for new words, 5 points for recapped words
      const pointsToAdd = isRecap ? 5 : 10;
      const updatedScore = await storage.incrementUserScore(userId, pointsToAdd);
      
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

  // ===== Vocabulary List Routes =====
  
  // Get all vocabulary lists for a user
  app.get("/api/users/:userId/vocabulary-lists", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const vocabularyLists = await storage.getVocabularyLists(userId);
      res.json({ vocabularyLists });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vocabulary lists" });
    }
  });
  
  // Get a specific vocabulary list
  app.get("/api/vocabulary-lists/:listId", async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      if (isNaN(listId)) {
        return res.status(400).json({ message: "Invalid list ID" });
      }

      const list = await storage.getVocabularyList(listId);
      if (!list) {
        return res.status(404).json({ message: "Vocabulary list not found" });
      }

      res.json({ list });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vocabulary list" });
    }
  });
  
  // Create a new vocabulary list
  app.post("/api/users/:userId/vocabulary-lists", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const now = new Date().toISOString();
      const listData: InsertVocabularyList = {
        ...req.body,
        userId,
        createdAt: now,
        updatedAt: now,
        description: req.body.description || null,
        icon: req.body.icon || "folder",
        color: req.body.color || "#8F87F1"
      };

      const validatedData = insertVocabularyListSchema.parse(listData);
      const vocabularyList = await storage.createVocabularyList(validatedData);
      
      res.status(201).json({ 
        success: true,
        vocabularyList
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid list data", error: error.errors });
      }
      res.status(500).json({ message: "Failed to create vocabulary list" });
    }
  });
  
  // Update a vocabulary list
  app.patch("/api/vocabulary-lists/:listId", async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      if (isNaN(listId)) {
        return res.status(400).json({ message: "Invalid list ID" });
      }

      const updates = {
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      const updatedList = await storage.updateVocabularyList(listId, updates);
      
      res.json({ 
        success: true,
        vocabularyList: updatedList
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update vocabulary list" });
    }
  });
  
  // Delete a vocabulary list
  app.delete("/api/vocabulary-lists/:listId", async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      if (isNaN(listId)) {
        return res.status(400).json({ message: "Invalid list ID" });
      }

      const deleted = await storage.deleteVocabularyList(listId);
      if (!deleted) {
        return res.status(404).json({ message: "Vocabulary list not found" });
      }
      
      res.json({ 
        success: true,
        message: "Vocabulary list deleted successfully"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vocabulary list" });
    }
  });
  
  // Get words in a vocabulary list
  app.get("/api/vocabulary-lists/:listId/words", async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      if (isNaN(listId)) {
        return res.status(400).json({ message: "Invalid list ID" });
      }

      const words = await storage.getVocabularyListWords(listId);
      res.json({ words });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vocabulary list words" });
    }
  });
  
  // Add a word to a vocabulary list
  app.post("/api/vocabulary-lists/:listId/words", async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      if (isNaN(listId)) {
        return res.status(400).json({ message: "Invalid list ID" });
      }

      const { wordId } = req.body;
      if (!wordId || isNaN(parseInt(wordId))) {
        return res.status(400).json({ message: "Invalid word ID" });
      }

      const listWordData: InsertVocabularyListWord = {
        listId,
        wordId: parseInt(wordId),
        addedAt: new Date().toISOString(),
        notes: req.body.notes || null
      };

      const validatedData = insertVocabularyListWordSchema.parse(listWordData);
      const listWord = await storage.addWordToVocabularyList(validatedData);
      
      res.status(201).json({ 
        success: true,
        listWord
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", error: error.errors });
      }
      res.status(500).json({ message: "Failed to add word to vocabulary list" });
    }
  });
  
  // Remove a word from a vocabulary list
  app.delete("/api/vocabulary-lists/:listId/words/:wordId", async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      const wordId = parseInt(req.params.wordId);
      
      if (isNaN(listId) || isNaN(wordId)) {
        return res.status(400).json({ message: "Invalid IDs" });
      }

      const removed = await storage.removeWordFromVocabularyList(listId, wordId);
      if (!removed) {
        return res.status(404).json({ message: "Word not found in vocabulary list" });
      }
      
      res.json({ 
        success: true,
        message: "Word removed from vocabulary list"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove word from vocabulary list" });
    }
  });
  
  // Update notes for a word in a vocabulary list
  app.patch("/api/vocabulary-list-words/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const updates = {
        notes: req.body.notes || null
      };

      const updatedListWord = await storage.updateWordInVocabularyList(id, updates);
      
      res.json({ 
        success: true,
        listWord: updatedListWord
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update word in vocabulary list" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
