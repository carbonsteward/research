import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { insertUserSchema, insertCompanySchema, insertInvestorSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthenticatedRequest extends Request {
  user?: any;
}

// JWT middleware
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);

      res.json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);

      res.json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Company routes
  app.post("/api/companies", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const companyData = insertCompanySchema.parse({
        ...req.body,
        userId: req.user.userId,
      });

      const company = await storage.createCompany(companyData);
      res.json(company);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/companies/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const company = await storage.getCompanyByUserId(req.user.userId);
      res.json(company);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/companies/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const company = await storage.updateCompany(id, req.body);
      res.json(company);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/companies/search", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        sdg: req.query.sdg ? (req.query.sdg as string).split(',') : undefined,
        sector: req.query.sector ? (req.query.sector as string).split(',') : undefined,
        stage: req.query.stage ? (req.query.stage as string).split(',') : undefined,
        location: req.query.location as string,
        minScore: req.query.minScore ? parseInt(req.query.minScore as string) : undefined,
      };

      const companies = await storage.searchCompanies(filters);
      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Investor routes
  app.post("/api/investors", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const investorData = insertInvestorSchema.parse({
        ...req.body,
        userId: req.user.userId,
      });

      const investor = await storage.createInvestor(investorData);
      res.json(investor);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/investors/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const investor = await storage.getInvestorByUserId(req.user.userId);
      res.json(investor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Questionnaire routes
  app.get("/api/questionnaire/modules", async (req, res) => {
    try {
      const modules = await storage.getQuestionnaireModules();
      res.json(modules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/questionnaire/questions", async (req, res) => {
    try {
      const questions = await storage.getQuestions();
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/questionnaire/modules/:moduleId/questions", async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const questions = await storage.getQuestionsByModule(moduleId);
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Response routes
  app.get("/api/companies/responses", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const company = await storage.getCompanyByUserId(req.user.userId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const responses = await storage.getCompanyResponses(company.id);
      res.json(responses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/companies/responses", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const company = await storage.getCompanyByUserId(req.user.userId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const response = await storage.saveCompanyResponse({
        ...req.body,
        companyId: company.id,
      });

      // Recalculate scores after saving response
      await calculateAndUpdateScores(company.id);

      res.json(response);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Score routes
  app.get("/api/companies/score", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const company = await storage.getCompanyByUserId(req.user.userId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const score = await storage.getCompanyScore(company.id);
      res.json(score);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Match routes
  app.get("/api/matches", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const userType = req.user.role === 'investor' ? 'investor' : 'company';
      const matches = await storage.getMatches(req.user.userId, userType);
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/matches", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'investor') {
        return res.status(403).json({ message: "Only investors can create matches" });
      }

      const investor = await storage.getInvestorByUserId(req.user.userId);
      if (!investor) {
        return res.status(404).json({ message: "Investor profile not found" });
      }

      if (investor.credits < 2) {
        return res.status(400).json({ message: "Insufficient credits" });
      }

      const match = await storage.createMatch({
        ...req.body,
        investorId: investor.id,
        creditsUsed: 2,
      });

      // Deduct credits
      await storage.updateInvestorCredits(investor.id, -2);
      await storage.createCreditTransaction({
        investorId: investor.id,
        amount: -2,
        type: 'deduction',
        description: 'Company profile unlock',
      });

      res.json(match);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/matches/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const match = await storage.updateMatch(id, req.body);
      res.json(match);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Chat routes
  app.get("/api/matches/:matchId/messages", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const matchId = parseInt(req.params.matchId);
      const messages = await storage.getChatMessages(matchId);

      // Mark messages as read
      await storage.markMessagesAsRead(matchId, req.user.userId);

      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/matches/:matchId/messages", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const matchId = parseInt(req.params.matchId);
      const message = await storage.createChatMessage({
        matchId,
        senderId: req.user.userId,
        message: req.body.message,
        messageType: req.body.messageType || 'text',
        fileUrl: req.body.fileUrl,
      });

      res.json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin routes
  app.post("/api/admin/modules", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const module = await storage.createQuestionnaireModule(req.body);
      res.json(module);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/admin/questions", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const question = await storage.createQuestion(req.body);
      res.json(question);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Initialize questionnaire data if empty
  app.post("/api/admin/init-questionnaire", async (req, res) => {
    try {
      await initializeQuestionnaireData();
      res.json({ message: "Questionnaire data initialized" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());

        // Broadcast message to all clients in the same match
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}

// Helper function to calculate scores
async function calculateAndUpdateScores(companyId: number) {
  try {
    const responses = await storage.getCompanyResponses(companyId);
    const questions = await storage.getQuestions();

    let totalDisclosurePoints = 0;
    let earnedDisclosurePoints = 0;
    let totalZebraPoints = { economic: 0, social: 0, biosphere: 0 };
    let earnedZebraPoints = { economic: 0, social: 0, biosphere: 0 };

    const responseMap = new Map(responses.map(r => [r.questionId, r]));

    for (const question of questions) {
      totalDisclosurePoints += question.disclosurePoints;

      // Determine category for zebra scoring
      const module = question.moduleId;
      let category: 'economic' | 'social' | 'biosphere' = 'economic';
      // This would need to be enhanced based on actual module mapping

      totalZebraPoints[category] += question.zebraPoints;

      const response = responseMap.get(question.id);
      if (response && response.responseValue) {
        earnedDisclosurePoints += question.disclosurePoints;

        // Calculate zebra points based on response quality
        const zebraScore = calculateZebraScore(question, response);
        earnedZebraPoints[category] += zebraScore;
      }
    }

    const disclosureScore = totalDisclosurePoints > 0 ?
      (earnedDisclosurePoints / totalDisclosurePoints) * 100 : 0;

    const zebraScoreEconomic = totalZebraPoints.economic > 0 ?
      (earnedZebraPoints.economic / totalZebraPoints.economic) * 100 : 0;

    const zebraScoreSocial = totalZebraPoints.social > 0 ?
      (earnedZebraPoints.social / totalZebraPoints.social) * 100 : 0;

    const zebraScoreBiosphere = totalZebraPoints.biosphere > 0 ?
      (earnedZebraPoints.biosphere / totalZebraPoints.biosphere) * 100 : 0;

    const overallScore = (zebraScoreEconomic + zebraScoreSocial + zebraScoreBiosphere) / 3;

    const completionPercentage = questions.length > 0 ?
      (responses.length / questions.length) * 100 : 0;

    await storage.updateCompanyScore(companyId, {
      disclosureScore: disclosureScore.toString(),
      zebraScoreEconomic: zebraScoreEconomic.toString(),
      zebraScoreSocial: zebraScoreSocial.toString(),
      zebraScoreBiosphere: zebraScoreBiosphere.toString(),
      overallScore: overallScore.toString(),
      completionPercentage: completionPercentage.toString(),
    });
  } catch (error) {
    console.error('Error calculating scores:', error);
  }
}

function calculateZebraScore(question: any, response: any): number {
  // Simplified scoring logic - would need to be enhanced based on question type and response
  if (!response.responseValue) return 0;

  switch (question.questionType) {
    case 'single_select':
    case 'multi_select':
      // For select questions, give full points if answered
      return question.zebraPoints;
    case 'text':
    case 'textarea':
      // For text questions, give points based on response length/quality
      const wordCount = response.responseValue.split(' ').length;
      return wordCount >= 10 ? question.zebraPoints : question.zebraPoints * 0.5;
    case 'number':
      // For numeric questions, give full points if answered
      return response.responseValue !== null ? question.zebraPoints : 0;
    case 'file_upload':
      // For file uploads, give full points if file provided
      return response.fileUrl ? question.zebraPoints : 0;
    default:
      return 0;
  }
}

// Initialize sample questionnaire data
async function initializeQuestionnaireData() {
  try {
    // Foundation modules
    const orgModule = await storage.createQuestionnaireModule({
      name: "Organization Overview",
      category: "foundation",
      displayOrder: 1,
      description: "Basic organizational information and structure"
    });

    const govModule = await storage.createQuestionnaireModule({
      name: "Governance",
      category: "foundation",
      displayOrder: 2,
      description: "Corporate governance and oversight structures"
    });

    const leadershipModule = await storage.createQuestionnaireModule({
      name: "Leadership",
      category: "foundation",
      displayOrder: 3,
      description: "Leadership diversity, development, and management"
    });

    const financialModule = await storage.createQuestionnaireModule({
      name: "Financial",
      category: "foundation",
      displayOrder: 4,
      description: "Financial performance and sustainability metrics"
    });

    // Impact modules
    const economicModule = await storage.createQuestionnaireModule({
      name: "Economic Impact",
      category: "impact",
      displayOrder: 5,
      description: "Economic value creation and job impact"
    });

    const socialModule = await storage.createQuestionnaireModule({
      name: "Social Impact",
      category: "impact",
      displayOrder: 6,
      description: "Social value creation and community impact"
    });

    const biosphereModule = await storage.createQuestionnaireModule({
      name: "Biosphere Impact",
      category: "impact",
      displayOrder: 7,
      description: "Environmental sustainability and impact"
    });

    // Sample questions
    await storage.createQuestion({
      moduleId: orgModule.id,
      questionText: "What type of organization are you?",
      questionType: "single_select",
      options: ["For-profit company", "Social enterprise", "NGO", "Cooperative", "Other"],
      isRequired: true,
      disclosurePoints: 1,
      zebraPoints: 0,
      displayOrder: 1,
      helpText: "Select the legal structure that best describes your organization"
    });

    await storage.createQuestion({
      moduleId: govModule.id,
      questionText: "Does your organization have an active Board of Directors or equivalent governing body?",
      questionType: "single_select",
      options: ["Yes", "No", "Planning to establish", "Not applicable"],
      isRequired: true,
      disclosurePoints: 1,
      zebraPoints: 2,
      displayOrder: 1,
      helpText: "A governing body provides oversight and strategic guidance"
    });

    await storage.createQuestion({
      moduleId: leadershipModule.id,
      questionText: "What percentage of your leadership team are women?",
      questionType: "number",
      isRequired: true,
      disclosurePoints: 1,
      zebraPoints: 3,
      displayOrder: 1,
      helpText: "Enter the percentage (0-100)"
    });

    console.log("Questionnaire data initialized successfully");
  } catch (error) {
    console.error("Error initializing questionnaire data:", error);
  }
}
