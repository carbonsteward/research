import { useState, useEffect, createContext, useContext } from 'react';
import { User, Company, Investor, AuthContextType } from '@/types/auth';
import { apiRequest } from '@/lib/queryClient';

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For demo purposes, set a default admin user
    // In production, this would check for stored auth tokens
    const demoUser: User = {
      id: 1,
      email: 'admin@twiga.com',
      name: 'Admin User',
      role: 'admin'
    };

    setUser(demoUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      const data = await response.json();

      setUser(data.user);
      localStorage.setItem('auth_token', data.token);

      // Fetch role-specific data
      if (data.user.role === 'company') {
        const companyResponse = await apiRequest('GET', '/api/companies/me');
        const companyData = await companyResponse.json();
        setCompany(companyData);
      } else if (data.user.role === 'investor') {
        const investorResponse = await apiRequest('GET', '/api/investors/me');
        const investorData = await investorResponse.json();
        setInvestor(investorData);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
    setInvestor(null);
    localStorage.removeItem('auth_token');
  };

  return {
    user,
    company,
    investor,
    login,
    logout,
    isLoading
  };
}

export { AuthContext };
