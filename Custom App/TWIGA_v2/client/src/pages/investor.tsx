import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanyCard } from '@/components/investor/CompanyCard';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { SwipeStack } from '@/components/swipe/SwipeStack';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Investor, Company, Match } from '@/types/questionnaire';
import {
  Search,
  DollarSign,
  Eye,
  HandHeart,
  MessageCircle,
  Filter,
  Star,
  TrendingUp,
  BarChart3,
  Users,
  Calendar,
  Building,
  MapPin,
  Target,
  CreditCard,
  Plus,
  Smartphone,
  Grid
} from 'lucide-react';

export default function InvestorPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [viewMode, setViewMode] = useState<'grid' | 'swipe'>('grid');
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    sdg: '',
    sector: '',
    stage: '',
    minRating: '',
    location: ''
  });
  const [unlockingCompanies, setUnlockingCompanies] = useState<Set<number>>(new Set());
  const [savedCompanies, setSavedCompanies] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: investor } = useQuery<Investor>({
    queryKey: ['/api/investors/me'],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies/search', searchFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const res = await apiRequest('GET', `/api/companies/search?${params}`);
      return res.json();
    },
  });

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ['/api/matches'],
  });

  const unlockCompanyMutation = useMutation({
    mutationFn: async (companyId: number) => {
      const res = await apiRequest('POST', '/api/matches', {
        companyId,
        requestMessage: 'Interested in learning more about your company and potential collaboration opportunities.'
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/investors/me'] });
      toast({
        title: "Profile Unlocked",
        description: "Company profile unlocked successfully. 2 credits deducted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unable to unlock profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUnlockCompany = async (companyId: number) => {
    setUnlockingCompanies(prev => new Set(prev).add(companyId));

    try {
      await unlockCompanyMutation.mutateAsync(companyId);
    } finally {
      setUnlockingCompanies(prev => {
        const newSet = new Set(prev);
        newSet.delete(companyId);
        return newSet;
      });
    }
  };

  const handleSaveCompany = (companyId: number) => {
    setSavedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
        toast({
          title: "Removed from watchlist",
          description: "Company removed from your watchlist.",
        });
      } else {
        newSet.add(companyId);
        toast({
          title: "Added to watchlist",
          description: "Company added to your watchlist.",
        });
      }
      return newSet;
    });
  };

  const handleSearchChange = (key: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSwipeMatch = async (companyId: number) => {
    await handleUnlockCompany(companyId);
  };

  const handleSwipePass = (companyId: number) => {
    // Track passes for analytics
    console.log('Passed on company:', companyId);
  };

  const handleRefreshCompanies = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/companies/search'] });
  };

  // Add demo scoring to companies for display
  const companiesWithScores = companies.map((company: any) => ({
    ...company,
    overallScore: Math.floor(Math.random() * 40) + 60,
    disclosureScore: Math.floor(Math.random() * 30) + 70,
  }));

  const activeMatches = matches.filter((m: any) => m.status === 'accepted');
  const pendingMatches = matches.filter((m: any) => m.status === 'pending');
  const savedCompaniesList = companiesWithScores.filter((c: any) => savedCompanies.has(c.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">T</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold">TWIGA</h1>
                  <p className="text-xs text-muted-foreground">Investor Portal</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4 mr-1 text-yellow-500" />
                <span className="font-medium text-foreground">Credits:</span>
                <span className="ml-1 font-bold">{investor?.credits || 24}</span>
              </div>

              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Buy Credits
              </Button>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-medium text-sm">I</span>
                </div>
                <span className="text-sm font-medium">{investor?.organizationName || 'Investor User'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Hero Section */}
          <Card className="bg-gradient-to-r from-secondary to-primary text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">Discover Impact Opportunities</h1>
                  <p className="text-white/80 mb-4">
                    Find and connect with sustainable companies aligned to your investment criteria
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <Badge className="bg-white/20 text-white">
                      <Search className="w-4 h-4 mr-1" />
                      Investor Portal
                    </Badge>
                    <Badge className="bg-white/20 text-white">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Credits: {investor?.credits || 24}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">{matches.length}</div>
                    <div className="text-sm text-white/80">Total Matches</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available Credits</p>
                    <p className="text-2xl font-bold">{investor?.credits || 24}</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <Button variant="link" className="p-0 h-auto text-xs mt-2">
                  Buy More Credits
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Companies Viewed</p>
                    <p className="text-2xl font-bold">{matches.length * 3}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">+{matches.length} this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Matches</p>
                    <p className="text-2xl font-bold">{activeMatches.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <HandHeart className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-green-600 mt-2">{pendingMatches.length} new this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Saved Companies</p>
                    <p className="text-2xl font-bold">{savedCompanies.size}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">In watchlist</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="search">Company Search</TabsTrigger>
              <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
              <TabsTrigger value="matches">My Matches</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-6">
              {/* Search Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Search Filters
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid className="h-4 w-4 mr-2" />
                        Grid
                      </Button>
                      <Button
                        variant={viewMode === 'swipe' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('swipe')}
                      >
                        <Smartphone className="h-4 w-4 mr-2" />
                        Swipe
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {viewMode === 'swipe' ? 'Swipe right to match, left to pass' : 'Refine your search to find the perfect investment opportunities'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Search Companies</label>
                      <Input
                        placeholder="Company name, keywords..."
                        value={searchFilters.search}
                        onChange={(e) => handleSearchChange('search', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">SDG Focus</label>
                      <Select value={searchFilters.sdg} onValueChange={(value) => handleSearchChange('sdg', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="All SDGs" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All SDGs</SelectItem>
                          <SelectItem value="SDG 6">SDG 6: Clean Water</SelectItem>
                          <SelectItem value="SDG 7">SDG 7: Clean Energy</SelectItem>
                          <SelectItem value="SDG 13">SDG 13: Climate Action</SelectItem>
                          <SelectItem value="SDG 3">SDG 3: Good Health</SelectItem>
                          <SelectItem value="SDG 12">SDG 12: Responsible Consumption</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Sector</label>
                      <Select value={searchFilters.sector} onValueChange={(value) => handleSearchChange('sector', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Sectors" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Sectors</SelectItem>
                          <SelectItem value="CleanTech">CleanTech</SelectItem>
                          <SelectItem value="FinTech">FinTech</SelectItem>
                          <SelectItem value="HealthTech">HealthTech</SelectItem>
                          <SelectItem value="AgriTech">AgriTech</SelectItem>
                          <SelectItem value="EdTech">EdTech</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Company Stage</label>
                      <Select value={searchFilters.stage} onValueChange={(value) => handleSearchChange('stage', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Stages" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Stages</SelectItem>
                          <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                          <SelectItem value="Seed">Seed</SelectItem>
                          <SelectItem value="Series A">Series A</SelectItem>
                          <SelectItem value="Series B">Series B</SelectItem>
                          <SelectItem value="Growth">Growth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Min. TWIGA Rating</label>
                      <Select value={searchFilters.minRating} onValueChange={(value) => handleSearchChange('minRating', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any Rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Rating</SelectItem>
                          <SelectItem value="70">70%+ (Reviewable)</SelectItem>
                          <SelectItem value="80">80%+ (Recommend)</SelectItem>
                          <SelectItem value="90">90%+ (High Match)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Location</label>
                      <Input
                        placeholder="City, Country, Region..."
                        value={searchFilters.location}
                        onChange={(e) => handleSearchChange('location', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <Button variant="outline" onClick={() => setSearchFilters({
                      search: '', sdg: '', sector: '', stage: '', minRating: '', location: ''
                    })}>
                      Clear Filters
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      {companiesWithScores.length} companies found
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Results */}
              <div className="space-y-4">
                {companiesWithScores.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No Companies Found</h3>
                      <p className="text-muted-foreground mb-4">
                        {Object.values(searchFilters).some(v => v)
                          ? "Try adjusting your search filters to find more companies."
                          : "There are no companies registered on the platform yet."
                        }
                      </p>
                      <Button variant="outline" onClick={() => setSearchFilters({
                        search: '', sdg: '', sector: '', stage: '', minRating: '', location: ''
                      })}>
                        Clear All Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {companiesWithScores.map((company: any) => (
                      <CompanyCard
                        key={company.id}
                        company={company}
                        onUnlock={handleUnlockCompany}
                        onSave={handleSaveCompany}
                        isUnlocking={unlockingCompanies.has(company.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="watchlist" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Saved Companies
                  </CardTitle>
                  <CardDescription>
                    Companies you've saved for future consideration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {savedCompaniesList.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No Saved Companies</h3>
                      <p className="text-muted-foreground mb-4">
                        Save companies to your watchlist to track them and get updates
                      </p>
                      <Button onClick={() => setActiveTab('search')}>
                        Browse Companies
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {savedCompaniesList.map((company: any) => (
                        <CompanyCard
                          key={company.id}
                          company={company}
                          onUnlock={handleUnlockCompany}
                          onSave={handleSaveCompany}
                          isUnlocking={unlockingCompanies.has(company.id)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HandHeart className="w-5 h-5" />
                    My Matches
                  </CardTitle>
                  <CardDescription>
                    Companies you've connected with and your match history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {matches.length === 0 ? (
                    <div className="text-center py-8">
                      <HandHeart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No Matches Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start exploring companies and unlock profiles to create matches
                      </p>
                      <Button onClick={() => setActiveTab('search')}>
                        Find Companies
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {matches.map((match: any) => (
                        <Card key={match.id} className="border-2">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                                  <Building className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-1">Company #{match.companyId}</h3>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {match.requestMessage || 'Match request sent'}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(match.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3" />
                                      {match.creditsUsed} credits used
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right space-y-2">
                                <Badge variant={
                                  match.status === 'accepted' ? 'default' :
                                  match.status === 'pending' ? 'secondary' : 'outline'
                                }>
                                  {match.status}
                                </Badge>
                                {match.status === 'accepted' && (
                                  <Button size="sm" variant="outline">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Chat
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Messages
                  </CardTitle>
                  <CardDescription>
                    Conversations with matched companies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Active Conversations</h3>
                    <p className="text-muted-foreground">
                      Messages will appear here once companies accept your match requests
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Investment Portfolio
                  </CardTitle>
                  <CardDescription>
                    Track your investments and portfolio performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Investments Yet</h3>
                    <p className="text-muted-foreground">
                      Your investment portfolio will be displayed here once you make investments
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Chat Widget */}
      <ChatWidget
        matchId={activeMatches[0]?.id}
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
      />
    </div>
  );
}
