import { 
  users, type User, type InsertUser,
  languages, type Language, type InsertLanguage,
  learnedWords, type LearnedWord, type InsertLearnedWord,
  userScores, type UserScore, type InsertUserScore
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Language operations
  getLanguages(): Promise<Language[]>;
  getLanguage(id: number): Promise<Language | undefined>;
  
  // LearnedWord operations
  getLearnedWords(userId: number): Promise<LearnedWord[]>;
  addLearnedWord(learnedWord: InsertLearnedWord): Promise<LearnedWord>;
  countLearnedWords(userId: number): Promise<number>;
  
  // UserScore operations
  getUserScore(userId: number): Promise<UserScore | undefined>;
  updateUserScore(userId: number, newScore: number): Promise<UserScore>;
  incrementUserScore(userId: number, points: number): Promise<UserScore>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private languages: Map<number, Language>;
  private learnedWords: Map<number, LearnedWord>;
  private userScores: Map<number, UserScore>;
  private userIdCounter: number;
  private learnedWordIdCounter: number;
  private userScoreIdCounter: number;

  constructor() {
    this.users = new Map();
    this.languages = new Map();
    this.learnedWords = new Map();
    this.userScores = new Map();
    this.userIdCounter = 1;
    this.learnedWordIdCounter = 1;
    this.userScoreIdCounter = 1;
    
    // Initialize with default languages
    this.initializeLanguages();
  }

  private initializeLanguages() {
    const defaultLanguages = [
      { name: "Spanish", code: "es", wordCount: 3248 },
      { name: "French", code: "fr", wordCount: 3145 },
      { name: "German", code: "de", wordCount: 2976 },
      { name: "Japanese", code: "ja", wordCount: 2348 },
      // Indian languages
      { name: "Hindi", code: "hi", wordCount: 3510 },
      { name: "Tamil", code: "ta", wordCount: 3275 },
      { name: "Telugu", code: "te", wordCount: 3150 },
      { name: "Malayalam", code: "ml", wordCount: 3300 },
    ] as const;
    
    defaultLanguages.forEach((lang, index) => {
      const id = index + 1;
      // Create a proper Language object
      const language: Language = {
        id,
        name: lang.name,
        code: lang.code,
        wordCount: lang.wordCount
      };
      this.languages.set(id, language);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    
    // Create initial user score
    await this.updateUserScore(id, 0);
    
    return user;
  }
  
  // Language operations
  async getLanguages(): Promise<Language[]> {
    return Array.from(this.languages.values());
  }
  
  async getLanguage(id: number): Promise<Language | undefined> {
    return this.languages.get(id);
  }
  
  // LearnedWord operations
  async getLearnedWords(userId: number): Promise<LearnedWord[]> {
    return Array.from(this.learnedWords.values())
      .filter(word => word.userId === userId);
  }
  
  async addLearnedWord(insertLearnedWord: InsertLearnedWord): Promise<LearnedWord> {
    const id = this.learnedWordIdCounter++;
    const learnedWord: LearnedWord = { ...insertLearnedWord, id };
    this.learnedWords.set(id, learnedWord);
    return learnedWord;
  }
  
  async countLearnedWords(userId: number): Promise<number> {
    return (await this.getLearnedWords(userId)).length;
  }
  
  // UserScore operations
  async getUserScore(userId: number): Promise<UserScore | undefined> {
    return Array.from(this.userScores.values())
      .find(score => score.userId === userId);
  }
  
  async updateUserScore(userId: number, newScore: number): Promise<UserScore> {
    const existingScore = await this.getUserScore(userId);
    
    // Calculate level (1 level per 100 points)
    const level = Math.floor(newScore / 100) + 1;
    
    if (existingScore) {
      existingScore.score = newScore;
      existingScore.level = level;
      this.userScores.set(existingScore.id, existingScore);
      return existingScore;
    } else {
      const id = this.userScoreIdCounter++;
      const userScore: UserScore = { id, userId, score: newScore, level };
      this.userScores.set(id, userScore);
      return userScore;
    }
  }
  
  async incrementUserScore(userId: number, points: number): Promise<UserScore> {
    const existingScore = await this.getUserScore(userId);
    const currentScore = existingScore ? existingScore.score : 0;
    return this.updateUserScore(userId, currentScore + points);
  }
}

export const storage = new MemStorage();
