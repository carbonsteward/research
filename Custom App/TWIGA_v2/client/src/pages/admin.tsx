import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ViewSwitcher } from '@/components/admin/ViewSwitcher';
import { QuestionnaireForm } from '@/components/questionnaire/QuestionnaireForm';
import { ScoreDisplay } from '@/components/scoring/ScoreDisplay';
import { CompanyCard } from '@/components/investor/CompanyCard';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { QuestionnaireModule, Question, Company } from '@/types/questionnaire';
import {
  Settings,
  Building,
  Search,
  Users,
  BarChart3,
  FileText,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Activity,
  DollarSign,
  UserCheck,
  MessageCircle
} from 'lucide-react';

type AdminView = 'admin' | 'company' | 'investor';

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<AdminView>('admin');
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [isCreateQuestionOpen, setIsCreateQuestionOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Admin data queries
  const { data: modules = [] } = useQuery<QuestionnaireModule[]>({
    queryKey: ['/api/questionnaire/modules'],
  });

  const { data: questions = [] } = useQuery<Question[]>({
    queryKey: ['/api/questionnaire/questions'],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies/search'],
  });

  // Initialize questionnaire data
  const initQuestionnaireMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/admin/init-questionnaire');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questionnaire/modules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/questionnaire/questions'] });
      toast({
        title: "Questionnaire Initialized",
        description: "Sample questionnaire data has been created successfully.",
      });
    },
  });

  // Create module mutation
  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: any) => {
      const res = await apiRequest('POST', '/api/admin/modules', moduleData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questionnaire/modules'] });
      setIsCreateModuleOpen(false);
      toast({
        title: "Module Created",
        description: "New questionnaire module has been created successfully.",
      });
    },
  });

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage the TWIGA platform and oversee all operations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => initQuestionnaireMutation.mutate()} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Initialize Sample Data
          </Button>
          <Dialog open={isCreateModuleOpen} onOpenChange={setIsCreateModuleOpen}>
            <DialogTrigger asChild>
              <Button className="twiga-button-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Module</DialogTitle>
                <DialogDescription>
                  Add a new questionnaire module to the TWIGA assessment
                </DialogDescription>
              </DialogHeader>
              <CreateModuleForm onSubmit={(data) => createModuleMutation.mutate(data)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Companies</p>
                <p className="text-2xl font-bold">{companies.length}</p>
              </div>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Modules</p>
                <p className="text-2xl font-bold">{modules.length}</p>
              </div>
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">{questions.length}</p>
              </div>
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platform Health</p>
                <p className="text-2xl font-bold text-green-600">100%</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Questionnaire Modules</CardTitle>
              <CardDescription>
                Manage the structure and organization of assessment modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((module: any) => (
                  <Card key={module.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{module.name}</h3>
                          <Badge variant={module.category === 'foundation' ? 'default' : 'secondary'}>
                            {module.category}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {module.description || 'No description'}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Order: {module.displayOrder} •
                        Questions: {questions.filter((q: any) => q.moduleId === module.id).length}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Question Management</CardTitle>
              <CardDescription>
                View and manage all assessment questions across modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question ID</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Question Text</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Scoring</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.slice(0, 10).map((question: any) => {
                    const module = modules.find((m: any) => m.id === question.moduleId);
                    return (
                      <TableRow key={question.id}>
                        <TableCell className="font-mono text-sm">Q-{question.id}</TableCell>
                        <TableCell>{module?.name || 'Unknown'}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {question.questionText}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{question.questionType}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          D:{question.disclosurePoints}, Z:{question.zebraPoints}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {questions.length > 10 && (
                <div className="text-center mt-4">
                  <Button variant="outline">View All {questions.length} Questions</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Management</CardTitle>
              <CardDescription>
                Overview of all companies registered on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No companies registered yet. Companies will appear here once they complete registration.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company: any) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.companyName}</TableCell>
                        <TableCell>{company.sector || 'Not specified'}</TableCell>
                        <TableCell>{company.stage || 'Not specified'}</TableCell>
                        <TableCell>
                          <Badge variant={company.isPublished ? 'default' : 'secondary'}>
                            {company.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(company.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Active Companies</span>
                    <span className="font-semibold">{companies.filter((c: any) => c.isPublished).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Draft Companies</span>
                    <span className="font-semibold">{companies.filter((c: any) => !c.isPublished).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Modules</span>
                    <span className="font-semibold">{modules.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Questions</span>
                    <span className="font-semibold">{questions.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>API Status</span>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Database</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Chat Service</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>File Storage</span>
                    <Badge className="bg-green-100 text-green-800">Available</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

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
                  <p className="text-xs text-muted-foreground">Match4Impact Platform</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-medium text-sm">A</span>
                </div>
                <span className="text-sm font-medium">Admin User</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'admin' && renderAdminDashboard()}
        {currentView === 'company' && <CompanyView />}
        {currentView === 'investor' && <InvestorView />}
      </main>

      {/* Chat Widget */}
      <ChatWidget
        matchId={1}
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
      />
    </div>
  );
}

function CreateModuleForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'foundation',
    description: '',
    displayOrder: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Module Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Environmental Impact"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Category</label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="foundation">Foundation</SelectItem>
            <SelectItem value="impact">Impact</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the purpose of this module"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Display Order</label>
        <Input
          type="number"
          value={formData.displayOrder}
          onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
          min={1}
        />
      </div>

      <Button type="submit" className="w-full twiga-button-primary">
        Create Module
      </Button>
    </form>
  );
}

function CompanyView() {
  return (
    <div className="space-y-6">
      {/* Company Header */}
      <Card className="twiga-gradient text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Welcome to TWIGA</h1>
              <p className="text-white/80 mb-4">Complete your sustainability assessment to connect with impact investors</p>
              <div className="flex items-center space-x-4 text-sm">
                <Badge className="bg-white/20 text-white">
                  <Building className="w-4 h-4 mr-1" />
                  Company Portal
                </Badge>
                <Badge className="bg-white/20 text-white">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Assessment Progress: 23%
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">67%</div>
                <div className="text-sm text-white/80">Disclosure Score</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Questionnaire */}
        <div className="lg:col-span-2">
          <QuestionnaireForm />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ScoreDisplay />

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Profile viewed</p>
                  <p className="text-xs text-muted-foreground">Green Capital Partners - 2 hours ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Match request received</p>
                  <p className="text-xs text-muted-foreground">Impact Ventures - 1 day ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InvestorView() {
  const [unlockingCompanies, setUnlockingCompanies] = useState<Set<number>>(new Set());

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies/search'],
  });

  const handleUnlockCompany = async (companyId: number) => {
    setUnlockingCompanies(prev => new Set(prev).add(companyId));

    // Simulate credit deduction and profile unlock
    setTimeout(() => {
      setUnlockingCompanies(prev => {
        const newSet = new Set(prev);
        newSet.delete(companyId);
        return newSet;
      });
    }, 1500);
  };

  const handleSaveCompany = (companyId: number) => {
    // Handle save to watchlist
    console.log('Save company:', companyId);
  };

  return (
    <div className="space-y-6">
      {/* Investor Header */}
      <Card className="bg-gradient-to-r from-secondary to-primary text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Discover Impact Opportunities</h1>
              <p className="text-white/80 mb-4">Find and connect with sustainable companies aligned to your investment criteria</p>
              <div className="flex items-center space-x-4 text-sm">
                <Badge className="bg-white/20 text-white">
                  <Search className="w-4 h-4 mr-1" />
                  Investor Portal
                </Badge>
                <Badge className="bg-white/20 text-white">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Credits: 24
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">47</div>
                <div className="text-sm text-white/80">Companies Matched</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
          <CardDescription>Refine your search to find the perfect investment opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">SDG Focus</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All SDGs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All SDGs</SelectItem>
                  <SelectItem value="sdg6">SDG 6: Clean Water</SelectItem>
                  <SelectItem value="sdg7">SDG 7: Clean Energy</SelectItem>
                  <SelectItem value="sdg13">SDG 13: Climate Action</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Sector</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="cleantech">CleanTech</SelectItem>
                  <SelectItem value="fintech">FinTech</SelectItem>
                  <SelectItem value="healthtech">HealthTech</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Stage</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="seed">Seed</SelectItem>
                  <SelectItem value="series-a">Series A</SelectItem>
                  <SelectItem value="series-b">Series B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Min. Rating</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Rating</SelectItem>
                  <SelectItem value="70">70%+ (Reviewable)</SelectItem>
                  <SelectItem value="80">80%+ (Recommend)</SelectItem>
                  <SelectItem value="90">90%+ (High Match)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button className="twiga-button-primary">
              <Search className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Company Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Investment Opportunities</h2>
          <p className="text-sm text-muted-foreground">
            {companies.length === 0 ? 'No companies found' : `${companies.length} companies match your criteria`}
          </p>
        </div>

        {companies.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Companies Found</h3>
              <p className="text-muted-foreground mb-4">
                There are no companies registered on the platform yet. Companies will appear here once they complete their registration and assessment.
              </p>
              <Button variant="outline">Adjust Search Filters</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {companies.map((company: any) => (
              <CompanyCard
                key={company.id}
                company={{
                  ...company,
                  overallScore: Math.floor(Math.random() * 40) + 60, // Demo scoring
                  disclosureScore: Math.floor(Math.random() * 30) + 70,
                }}
                onUnlock={handleUnlockCompany}
                onSave={handleSaveCompany}
                isUnlocking={unlockingCompanies.has(company.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
