import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - base for all user types
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "company", "investor"] }).notNull(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  description: text("description"),
  website: text("website"),
  sector: text("sector"),
  stage: text("stage"),
  location: text("location"),
  logoUrl: text("logo_url"),
  sdgFocus: text("sdg_focus").array(),
  foundingYear: integer("founding_year"),
  employeeCount: integer("employee_count"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Investors table
export const investors = pgTable("investors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  organizationType: text("organization_type"),
  organizationName: text("organization_name").notNull(),
  jobTitle: text("job_title"),
  investmentStages: text("investment_stages").array(),
  investmentSizes: text("investment_sizes").array(),
  sdgInterests: text("sdg_interests").array(),
  sectorFocus: text("sector_focus").array(),
  geographicFocus: text("geographic_focus").array(),
  credits: integer("credits").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Questionnaire modules
export const questionnaireModules = pgTable("questionnaire_modules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category", { enum: ["foundation", "impact"] }).notNull(),
  subcategory: text("subcategory"),
  displayOrder: integer("display_order").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"),
});

// Questions
export const questions: any = pgTable("questions", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => questionnaireModules.id),
  questionText: text("question_text").notNull(),
  questionType: text("question_type", { enum: ["single_select", "multi_select", "text", "textarea", "number", "file_upload"] }).notNull(),
  options: jsonb("options"), // For select questions
  isRequired: boolean("is_required").notNull().default(false),
  disclosurePoints: integer("disclosure_points").notNull().default(0),
  zebraPoints: integer("zebra_points").notNull().default(0),
  displayOrder: integer("display_order").notNull(),
  dependsOnQuestionId: integer("depends_on_question_id").references((): any => questions.id),
  dependsOnValue: text("depends_on_value"),
  helpText: text("help_text"),
  sdgMapping: text("sdg_mapping").array(),
});

// Company responses
export const companyResponses = pgTable("company_responses", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  questionId: integer("question_id").notNull().references(() => questions.id),
  responseValue: text("response_value"),
  responseData: jsonb("response_data"), // For complex responses
  fileUrl: text("file_url"), // For file uploads
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Company scores
export const companyScores = pgTable("company_scores", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  disclosureScore: decimal("disclosure_score", { precision: 5, scale: 2 }),
  zebraScoreEconomic: decimal("zebra_score_economic", { precision: 5, scale: 2 }),
  zebraScoreSocial: decimal("zebra_score_social", { precision: 5, scale: 2 }),
  zebraScoreBiosphere: decimal("zebra_score_biosphere", { precision: 5, scale: 2 }),
  overallScore: decimal("overall_score", { precision: 5, scale: 2 }),
  completionPercentage: decimal("completion_percentage", { precision: 5, scale: 2 }),
  lastCalculated: timestamp("last_calculated").notNull().defaultNow(),
});

// Matches and requests
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").notNull().references(() => investors.id),
  companyId: integer("company_id").notNull().references(() => companies.id),
  status: text("status", { enum: ["pending", "accepted", "declined", "expired"] }).notNull().default("pending"),
  requestMessage: text("request_message"),
  creditsUsed: integer("credits_used").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  messageType: text("message_type", { enum: ["text", "file"] }).notNull().default("text"),
  fileUrl: text("file_url"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Data room files
export const dataRoomFiles = pgTable("data_room_files", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  uploadedById: integer("uploaded_by_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  description: text("description"),
  accessLevel: text("access_level", { enum: ["both", "investor_only", "company_only"] }).notNull().default("both"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Credits transactions
export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").notNull().references(() => investors.id),
  amount: integer("amount").notNull(),
  type: text("type", { enum: ["purchase", "deduction", "refund"] }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.id],
    references: [companies.userId],
  }),
  investor: one(investors, {
    fields: [users.id],
    references: [investors.userId],
  }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  responses: many(companyResponses),
  scores: one(companyScores),
  matches: many(matches),
}));

export const investorsRelations = relations(investors, ({ one, many }) => ({
  user: one(users, {
    fields: [investors.userId],
    references: [users.id],
  }),
  matches: many(matches),
  creditTransactions: many(creditTransactions),
}));

export const questionnaireModulesRelations = relations(questionnaireModules, ({ many }) => ({
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  module: one(questionnaireModules, {
    fields: [questions.moduleId],
    references: [questionnaireModules.id],
  }),
  responses: many(companyResponses),
  dependsOn: one(questions, {
    fields: [questions.dependsOnQuestionId],
    references: [questions.id],
  }),
}));

export const companyResponsesRelations = relations(companyResponses, ({ one }) => ({
  company: one(companies, {
    fields: [companyResponses.companyId],
    references: [companies.id],
  }),
  question: one(questions, {
    fields: [companyResponses.questionId],
    references: [questions.id],
  }),
}));

export const companyScoresRelations = relations(companyScores, ({ one }) => ({
  company: one(companies, {
    fields: [companyScores.companyId],
    references: [companies.id],
  }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  investor: one(investors, {
    fields: [matches.investorId],
    references: [investors.id],
  }),
  company: one(companies, {
    fields: [matches.companyId],
    references: [companies.id],
  }),
  chatMessages: many(chatMessages),
  dataRoomFiles: many(dataRoomFiles),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  match: one(matches, {
    fields: [chatMessages.matchId],
    references: [matches.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));

export const dataRoomFilesRelations = relations(dataRoomFiles, ({ one }) => ({
  match: one(matches, {
    fields: [dataRoomFiles.matchId],
    references: [matches.id],
  }),
  uploadedBy: one(users, {
    fields: [dataRoomFiles.uploadedById],
    references: [users.id],
  }),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  investor: one(investors, {
    fields: [creditTransactions.investorId],
    references: [investors.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvestorSchema = createInsertSchema(investors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuestionnaireModuleSchema = createInsertSchema(questionnaireModules).omit({
  id: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertCompanyResponseSchema = createInsertSchema(companyResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertInvestor = z.infer<typeof insertInvestorSchema>;
export type Investor = typeof investors.$inferSelect;
export type QuestionnaireModule = typeof questionnaireModules.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type InsertCompanyResponse = z.infer<typeof insertCompanyResponseSchema>;
export type CompanyResponse = typeof companyResponses.$inferSelect;
export type CompanyScore = typeof companyScores.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
