import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  wordCount: integer("word_count").notNull().default(0),
});

export const learnedWords = pgTable("learned_words", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  word: text("word").notNull(),
  translation: text("translation").notNull(),
  languageId: integer("language_id").notNull(),
  learnedAt: text("learned_at").notNull(),
});

export const userScores = pgTable("user_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  score: integer("score").notNull().default(0),
  level: integer("level").notNull().default(1),
});

// New tables for vocabulary lists functionality
export const vocabularyLists = pgTable("vocabulary_lists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"), // can be null
  languageId: integer("language_id").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  icon: text("icon").default("folder"), // Material icon name
  color: text("color").default("#8F87F1"),
});

export const vocabularyListWords = pgTable("vocabulary_list_words", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull(),
  wordId: integer("word_id").notNull(), // References learnedWords.id
  addedAt: text("added_at").notNull(),
  notes: text("notes"), // can be null
});

// Types and schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLanguageSchema = createInsertSchema(languages).pick({
  name: true,
  code: true,
  wordCount: true,
});

export const insertLearnedWordSchema = createInsertSchema(learnedWords).pick({
  userId: true,
  word: true,
  translation: true,
  languageId: true,
  learnedAt: true,
});

export const insertUserScoreSchema = createInsertSchema(userScores).pick({
  userId: true,
  score: true,
  level: true,
});

export const insertVocabularyListSchema = createInsertSchema(vocabularyLists).pick({
  userId: true,
  name: true,
  description: true,
  languageId: true,
  createdAt: true,
  updatedAt: true,
  icon: true,
  color: true,
});

export const insertVocabularyListWordSchema = createInsertSchema(vocabularyListWords).pick({
  listId: true,
  wordId: true,
  addedAt: true,
  notes: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLanguage = z.infer<typeof insertLanguageSchema>;
export type Language = typeof languages.$inferSelect;

export type InsertLearnedWord = z.infer<typeof insertLearnedWordSchema>;
export type LearnedWord = typeof learnedWords.$inferSelect;

export type InsertUserScore = z.infer<typeof insertUserScoreSchema>;
export type UserScore = typeof userScores.$inferSelect;

export type InsertVocabularyList = z.infer<typeof insertVocabularyListSchema>;
export type VocabularyList = typeof vocabularyLists.$inferSelect;

export type InsertVocabularyListWord = z.infer<typeof insertVocabularyListWordSchema>;
export type VocabularyListWord = typeof vocabularyListWords.$inferSelect;
