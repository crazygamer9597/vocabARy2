import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLanguage = z.infer<typeof insertLanguageSchema>;
export type Language = typeof languages.$inferSelect;

export type InsertLearnedWord = z.infer<typeof insertLearnedWordSchema>;
export type LearnedWord = typeof learnedWords.$inferSelect;

export type InsertUserScore = z.infer<typeof insertUserScoreSchema>;
export type UserScore = typeof userScores.$inferSelect;
