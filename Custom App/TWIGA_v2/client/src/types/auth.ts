export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'company' | 'investor';
}

export interface Company {
  id: number;
  userId: number;
  companyName: string;
  description?: string;
  website?: string;
  sector?: string;
  stage?: string;
  location?: string;
  logoUrl?: string;
  sdgFocus?: string[];
  foundingYear?: number;
  employeeCount?: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Investor {
  id: number;
  userId: number;
  organizationType?: string;
  organizationName: string;
  jobTitle?: string;
  investmentStages?: string[];
  investmentSizes?: string[];
  sdgInterests?: string[];
  sectorFocus?: string[];
  geographicFocus?: string[];
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  company: Company | null;
  investor: Investor | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
