import {
  users, companies, investors, questionnaireModules, questions, companyResponses,
  companyScores, matches, chatMessages, dataRoomFiles, creditTransactions,
  type User, type InsertUser, type Company, type InsertCompany,
  type Investor, type InsertInvestor, type QuestionnaireModule, type Question,
  type CompanyResponse, type InsertCompanyResponse, type Match, type InsertMatch,
  type ChatMessage, type InsertChatMessage, type CompanyScore
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, ilike, inArray } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Company methods
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByUserId(userId: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, data: Partial<InsertCompany>): Promise<Company>;
  searchCompanies(filters: CompanySearchFilters): Promise<Company[]>;

  // Investor methods
  getInvestor(id: number): Promise<Investor | undefined>;
  getInvestorByUserId(userId: number): Promise<Investor | undefined>;
  createInvestor(investor: InsertInvestor): Promise<Investor>;
  updateInvestor(id: number, data: Partial<InsertInvestor>): Promise<Investor>;

  // Questionnaire methods
  getQuestionnaireModules(): Promise<QuestionnaireModule[]>;
  getQuestionsByModule(moduleId: number): Promise<Question[]>;
  getQuestions(): Promise<Question[]>;
  createQuestionnaireModule(module: any): Promise<QuestionnaireModule>;
  createQuestion(question: any): Promise<Question>;

  // Response methods
  getCompanyResponses(companyId: number): Promise<CompanyResponse[]>;
  getCompanyResponse(companyId: number, questionId: number): Promise<CompanyResponse | undefined>;
  saveCompanyResponse(response: InsertCompanyResponse): Promise<CompanyResponse>;
  updateCompanyResponse(id: number, data: Partial<InsertCompanyResponse>): Promise<CompanyResponse>;

  // Scoring methods
  getCompanyScore(companyId: number): Promise<CompanyScore | undefined>;
  updateCompanyScore(companyId: number, scores: Partial<CompanyScore>): Promise<CompanyScore>;

  // Match methods
  getMatches(userId: number, userType: 'investor' | 'company'): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: number, data: Partial<Match>): Promise<Match>;
  getMatch(id: number): Promise<Match | undefined>;

  // Chat methods
  getChatMessages(matchId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessagesAsRead(matchId: number, userId: number): Promise<void>;

  // Credit methods
  updateInvestorCredits(investorId: number, amount: number): Promise<void>;
  createCreditTransaction(transaction: any): Promise<void>;
}

interface CompanySearchFilters {
  sdg?: string[];
  sector?: string[];
  stage?: string[];
  location?: string;
  minScore?: number;
  search?: string;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanyByUserId(userId: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.userId, userId));
    return company || undefined;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: number, data: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db.update(companies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  async searchCompanies(filters: CompanySearchFilters): Promise<Company[]> {
    const conditions = [eq(companies.isPublished, true)];

    if (filters.search) {
      conditions.push(
        sql`${companies.companyName} ILIKE ${`%${filters.search}%`} OR ${companies.description} ILIKE ${`%${filters.search}%`}`
      );
    }

    if (filters.sector && filters.sector.length > 0) {
      conditions.push(inArray(companies.sector, filters.sector));
    }

    if (filters.stage && filters.stage.length > 0) {
      conditions.push(inArray(companies.stage, filters.stage));
    }

    if (filters.location) {
      conditions.push(ilike(companies.location, `%${filters.location}%`));
    }

    return await db.select()
      .from(companies)
      .where(and(...conditions))
      .orderBy(desc(companies.createdAt));
  }

  async getInvestor(id: number): Promise<Investor | undefined> {
    const [investor] = await db.select().from(investors).where(eq(investors.id, id));
    return investor || undefined;
  }

  async getInvestorByUserId(userId: number): Promise<Investor | undefined> {
    const [investor] = await db.select().from(investors).where(eq(investors.userId, userId));
    return investor || undefined;
  }

  async createInvestor(investor: InsertInvestor): Promise<Investor> {
    const [newInvestor] = await db.insert(investors).values(investor).returning();
    return newInvestor;
  }

  async updateInvestor(id: number, data: Partial<InsertInvestor>): Promise<Investor> {
    const [investor] = await db.update(investors)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(investors.id, id))
      .returning();
    return investor;
  }

  async getQuestionnaireModules(): Promise<QuestionnaireModule[]> {
    return await db.select()
      .from(questionnaireModules)
      .where(eq(questionnaireModules.isActive, true))
      .orderBy(asc(questionnaireModules.displayOrder));
  }

  async getQuestionsByModule(moduleId: number): Promise<Question[]> {
    return await db.select()
      .from(questions)
      .where(eq(questions.moduleId, moduleId))
      .orderBy(asc(questions.displayOrder));
  }

  async getQuestions(): Promise<Question[]> {
    return await db.select()
      .from(questions)
      .orderBy(asc(questions.moduleId), asc(questions.displayOrder));
  }

  async createQuestionnaireModule(module: any): Promise<QuestionnaireModule> {
    const [newModule] = await db.insert(questionnaireModules).values(module).returning();
    return newModule;
  }

  async createQuestion(question: any): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning() as Question[];
    return newQuestion;
  }

  async getCompanyResponses(companyId: number): Promise<CompanyResponse[]> {
    return await db.select()
      .from(companyResponses)
      .where(eq(companyResponses.companyId, companyId))
      .orderBy(asc(companyResponses.questionId));
  }

  async getCompanyResponse(companyId: number, questionId: number): Promise<CompanyResponse | undefined> {
    const [response] = await db.select()
      .from(companyResponses)
      .where(and(
        eq(companyResponses.companyId, companyId),
        eq(companyResponses.questionId, questionId)
      ));
    return response || undefined;
  }

  async saveCompanyResponse(response: InsertCompanyResponse): Promise<CompanyResponse> {
    const existing = await this.getCompanyResponse(response.companyId, response.questionId);

    if (existing) {
      const [updated] = await db.update(companyResponses)
        .set({ ...response, updatedAt: new Date() })
        .where(eq(companyResponses.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newResponse] = await db.insert(companyResponses).values(response).returning();
      return newResponse;
    }
  }

  async updateCompanyResponse(id: number, data: Partial<InsertCompanyResponse>): Promise<CompanyResponse> {
    const [response] = await db.update(companyResponses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(companyResponses.id, id))
      .returning();
    return response;
  }

  async getCompanyScore(companyId: number): Promise<CompanyScore | undefined> {
    const [score] = await db.select().from(companyScores).where(eq(companyScores.companyId, companyId));
    return score || undefined;
  }

  async updateCompanyScore(companyId: number, scores: Partial<CompanyScore>): Promise<CompanyScore> {
    const existing = await this.getCompanyScore(companyId);

    if (existing) {
      const [updated] = await db.update(companyScores)
        .set({ ...scores, lastCalculated: new Date() })
        .where(eq(companyScores.companyId, companyId))
        .returning();
      return updated;
    } else {
      const [newScore] = await db.insert(companyScores)
        .values({ ...scores, companyId, lastCalculated: new Date() })
        .returning();
      return newScore;
    }
  }

  async getMatches(userId: number, userType: 'investor' | 'company'): Promise<Match[]> {
    if (userType === 'investor') {
      const investor = await this.getInvestorByUserId(userId);
      if (!investor) return [];

      return await db.select()
        .from(matches)
        .where(eq(matches.investorId, investor.id))
        .orderBy(desc(matches.createdAt));
    } else {
      const company = await this.getCompanyByUserId(userId);
      if (!company) return [];

      return await db.select()
        .from(matches)
        .where(eq(matches.companyId, company.id))
        .orderBy(desc(matches.createdAt));
    }
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [newMatch] = await db.insert(matches).values(match).returning();
    return newMatch;
  }

  async updateMatch(id: number, data: Partial<Match>): Promise<Match> {
    const [match] = await db.update(matches)
      .set({ ...data, respondedAt: data.status ? new Date() : undefined })
      .where(eq(matches.id, id))
      .returning();
    return match;
  }

  async getMatch(id: number): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match || undefined;
  }

  async getChatMessages(matchId: number): Promise<ChatMessage[]> {
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.matchId, matchId))
      .orderBy(asc(chatMessages.createdAt));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async markMessagesAsRead(matchId: number, userId: number): Promise<void> {
    await db.update(chatMessages)
      .set({ isRead: true })
      .where(and(
        eq(chatMessages.matchId, matchId),
        sql`${chatMessages.senderId} != ${userId}`
      ));
  }

  async updateInvestorCredits(investorId: number, amount: number): Promise<void> {
    await db.update(investors)
      .set({ credits: sql`${investors.credits} + ${amount}` })
      .where(eq(investors.id, investorId));
  }

  async createCreditTransaction(transaction: any): Promise<void> {
    await db.insert(creditTransactions).values(transaction);
  }
}

export const storage = new DatabaseStorage();
