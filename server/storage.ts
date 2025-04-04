import { 
  users, type User, type InsertUser,
  languages, type Language, type InsertLanguage,
  learnedWords, type LearnedWord, type InsertLearnedWord,
  userScores, type UserScore, type InsertUserScore,
  vocabularyLists, type VocabularyList, type InsertVocabularyList,
  vocabularyListWords, type VocabularyListWord, type InsertVocabularyListWord
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
  getLearnedWord(id: number): Promise<LearnedWord | undefined>;
  addLearnedWord(learnedWord: InsertLearnedWord): Promise<LearnedWord>;
  countLearnedWords(userId: number): Promise<number>;
  
  // UserScore operations
  getUserScore(userId: number): Promise<UserScore | undefined>;
  updateUserScore(userId: number, newScore: number): Promise<UserScore>;
  incrementUserScore(userId: number, points: number): Promise<UserScore>;
  
  // VocabularyList operations
  getVocabularyLists(userId: number): Promise<VocabularyList[]>;
  getVocabularyList(id: number): Promise<VocabularyList | undefined>;
  createVocabularyList(list: InsertVocabularyList): Promise<VocabularyList>;
  updateVocabularyList(id: number, updates: Partial<InsertVocabularyList>): Promise<VocabularyList>;
  deleteVocabularyList(id: number): Promise<boolean>;
  
  // VocabularyListWord operations
  getVocabularyListWords(listId: number): Promise<{word: LearnedWord, metadata: VocabularyListWord}[]>;
  addWordToVocabularyList(listWordData: InsertVocabularyListWord): Promise<VocabularyListWord>;
  removeWordFromVocabularyList(listId: number, wordId: number): Promise<boolean>;
  updateWordInVocabularyList(id: number, updates: Partial<InsertVocabularyListWord>): Promise<VocabularyListWord>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private languages: Map<number, Language>;
  private learnedWords: Map<number, LearnedWord>;
  private userScores: Map<number, UserScore>;
  private vocabularyLists: Map<number, VocabularyList>;
  private vocabularyListWords: Map<number, VocabularyListWord>;
  private userIdCounter: number;
  private learnedWordIdCounter: number;
  private userScoreIdCounter: number;
  private vocabularyListIdCounter: number;
  private vocabularyListWordIdCounter: number;

  constructor() {
    this.users = new Map();
    this.languages = new Map();
    this.learnedWords = new Map();
    this.userScores = new Map();
    this.vocabularyLists = new Map();
    this.vocabularyListWords = new Map();
    this.userIdCounter = 1;
    this.learnedWordIdCounter = 1;
    this.userScoreIdCounter = 1;
    this.vocabularyListIdCounter = 1;
    this.vocabularyListWordIdCounter = 1;
    
    // Initialize with default languages
    this.initializeLanguages();
  }

  private initializeLanguages() {
    const defaultLanguages = [
      // Set Tamil as the first language to ensure it's the default
      { name: "Tamil", code: "ta", wordCount: 3275 },
      // Other Indian languages 
      { name: "Hindi", code: "hi", wordCount: 3510 },
      { name: "Telugu", code: "te", wordCount: 3150 },
      { name: "Malayalam", code: "ml", wordCount: 3300 },
      // Other languages
      { name: "Spanish", code: "es", wordCount: 3248 },
      { name: "French", code: "fr", wordCount: 3145 },
      { name: "German", code: "de", wordCount: 2976 },
      { name: "Japanese", code: "ja", wordCount: 2348 },
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

  // Implement getLearnedWord
  async getLearnedWord(id: number): Promise<LearnedWord | undefined> {
    return this.learnedWords.get(id);
  }

  // VocabularyList operations
  async getVocabularyLists(userId: number): Promise<VocabularyList[]> {
    return Array.from(this.vocabularyLists.values())
      .filter(list => list.userId === userId);
  }

  async getVocabularyList(id: number): Promise<VocabularyList | undefined> {
    return this.vocabularyLists.get(id);
  }

  async createVocabularyList(list: InsertVocabularyList): Promise<VocabularyList> {
    const id = this.vocabularyListIdCounter++;
    // Ensure null values for optional fields to satisfy the type
    const vocabularyList: VocabularyList = { 
      ...list, 
      id,
      description: list.description !== undefined ? list.description : null,
      icon: list.icon !== undefined ? list.icon : "folder",
      color: list.color !== undefined ? list.color : "#8F87F1"
    };
    this.vocabularyLists.set(id, vocabularyList);
    return vocabularyList;
  }

  async updateVocabularyList(id: number, updates: Partial<InsertVocabularyList>): Promise<VocabularyList> {
    const existingList = await this.getVocabularyList(id);
    if (!existingList) {
      throw new Error(`Vocabulary list with id ${id} not found`);
    }
    
    const updatedList: VocabularyList = { 
      ...existingList, 
      ...updates,
      id // Keep the original id
    };
    
    this.vocabularyLists.set(id, updatedList);
    return updatedList;
  }

  async deleteVocabularyList(id: number): Promise<boolean> {
    // Delete the vocabulary list
    const wasDeleted = this.vocabularyLists.delete(id);
    
    // Also delete all words associated with this list
    const wordsToDelete = Array.from(this.vocabularyListWords.values())
      .filter(word => word.listId === id);
    
    for (const word of wordsToDelete) {
      this.vocabularyListWords.delete(word.id);
    }
    
    return wasDeleted;
  }

  // VocabularyListWord operations
  async getVocabularyListWords(listId: number): Promise<{word: LearnedWord, metadata: VocabularyListWord}[]> {
    const listWords = Array.from(this.vocabularyListWords.values())
      .filter(listWord => listWord.listId === listId);
    
    const result = [];
    for (const metadata of listWords) {
      const word = await this.getLearnedWord(metadata.wordId);
      if (word) {
        result.push({ word, metadata });
      }
    }
    
    return result;
  }

  async addWordToVocabularyList(listWordData: InsertVocabularyListWord): Promise<VocabularyListWord> {
    // Check if the word is already in the list
    const existingListWords = Array.from(this.vocabularyListWords.values())
      .filter(lw => lw.listId === listWordData.listId && lw.wordId === listWordData.wordId);
    
    if (existingListWords.length > 0) {
      return existingListWords[0]; // Word already exists in the list
    }
    
    // Add the word to the list
    const id = this.vocabularyListWordIdCounter++;
    const listWord: VocabularyListWord = { 
      ...listWordData, 
      id,
      notes: listWordData.notes !== undefined ? listWordData.notes : null 
    };
    this.vocabularyListWords.set(id, listWord);
    return listWord;
  }

  async removeWordFromVocabularyList(listId: number, wordId: number): Promise<boolean> {
    const listWord = Array.from(this.vocabularyListWords.values())
      .find(lw => lw.listId === listId && lw.wordId === wordId);
    
    if (!listWord) {
      return false;
    }
    
    return this.vocabularyListWords.delete(listWord.id);
  }

  async updateWordInVocabularyList(id: number, updates: Partial<InsertVocabularyListWord>): Promise<VocabularyListWord> {
    const existingListWord = this.vocabularyListWords.get(id);
    if (!existingListWord) {
      throw new Error(`List word with id ${id} not found`);
    }
    
    const updatedListWord: VocabularyListWord = { 
      ...existingListWord, 
      ...updates,
      id // Keep the original id
    };
    
    this.vocabularyListWords.set(id, updatedListWord);
    return updatedListWord;
  }
}

export const storage = new MemStorage();
