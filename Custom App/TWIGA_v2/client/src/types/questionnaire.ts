// Import types from shared schema
import type {
  Company as BaseCompany,
  Investor as BaseInvestor,
  Match as BaseMatch,
  ChatMessage,
  User,
  CompanyScore,
  CompanyResponse,
  QuestionnaireModule,
  Question
} from '../../../shared/schema';

// Re-export for convenience
export type {
  ChatMessage,
  User,
  CompanyScore,
  CompanyResponse,
  QuestionnaireModule,
  Question
};

export type Company = BaseCompany;
export type Investor = BaseInvestor;
export type Match = BaseMatch;

// Additional UI-specific types
export interface ExtendedCompany extends Company {
  overallScore?: number;
  disclosureScore?: number;
}

export interface ExtendedMatch extends Match {
  company?: Company;
  investor?: Investor;
}

export interface QuestionnaireProgress {
  totalQuestions: number;
  answeredQuestions: number;
  completionPercentage: number;
  moduleProgress: {
    [moduleId: number]: {
      total: number;
      answered: number;
      percentage: number;
    };
  };
}
