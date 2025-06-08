import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionnaireForm } from '@/components/questionnaire/QuestionnaireForm';
import { ScoreDisplay } from '@/components/scoring/ScoreDisplay';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { Company, CompanyScore, Match } from '@/types/questionnaire';
import {
  Building,
  BarChart3,
  MessageCircle,
  FileText,
  Users,
  TrendingUp,
  Eye,
  HandHeart,
  Mail,
  Calendar,
  Globe,
  Award,
  Target,
  CheckCircle
} from 'lucide-react';

export default function CompanyPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('assessment');

  const { data: company } = useQuery<Company>({
    queryKey: ['/api/companies/me'],
  });

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ['/api/matches'],
  });

  const { data: score } = useQuery<CompanyScore>({
    queryKey: ['/api/companies/score'],
  });

  const disclosureScore = parseFloat(score?.disclosureScore || '0');
  const overallScore = parseFloat(score?.overallScore || '0');
  const completionPercentage = parseFloat(score?.completionPercentage || '0');

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'High Match', className: 'bg-green-100 text-green-800' };
    if (score >= 80) return { label: 'Recommend', className: 'bg-blue-100 text-blue-800' };
    if (score >= 70) return { label: 'Reviewable', className: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Progress', className: 'bg-gray-100 text-gray-800' };
  };

  const scoreBadge = getScoreBadge(overallScore);

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
                  <p className="text-xs text-muted-foreground">Company Portal</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800">
                <Building className="w-4 h-4 mr-1" />
                Company Account
              </Badge>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-medium text-sm">C</span>
                </div>
                <span className="text-sm font-medium">{company?.companyName || 'Company User'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Hero Section */}
          <Card className="twiga-gradient text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">Welcome to TWIGA</h1>
                  <p className="text-white/80 mb-4">
                    Complete your sustainability assessment to connect with impact investors
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <Badge className="bg-white/20 text-white">
                      <Building className="w-4 h-4 mr-1" />
                      Company Portal
                    </Badge>
                    <Badge className="bg-white/20 text-white">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Assessment Progress: {Math.round(completionPercentage)}%
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">{Math.round(disclosureScore)}%</div>
                    <div className="text-sm text-white/80">Disclosure Score</div>
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
                    <p className="text-sm font-medium text-muted-foreground">Assessment Progress</p>
                    <p className="text-2xl font-bold">{Math.round(completionPercentage)}%</p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={completionPercentage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Investor Interest</p>
                    <p className="text-2xl font-bold">{matches.filter((m: any) => m.status === 'pending').length}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Profile views this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Match Requests</p>
                    <p className="text-2xl font-bold">{matches.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <HandHeart className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-green-600 mt-2">
                  {matches.filter((m: any) => m.status === 'pending').length} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Chats</p>
                    <p className="text-2xl font-bold">{matches.filter((m: any) => m.status === 'accepted').length}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">1 new message</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
              <TabsTrigger value="rating">TWIGA Rating</TabsTrigger>
              <TabsTrigger value="matches">Match Requests</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="assessment" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <QuestionnaireForm />
                </div>

                <div className="space-y-6">
                  <ScoreDisplay />

                  {/* Quick Tips */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Assessment Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p>Complete at least 70% for Zebra Score calculation</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p>Provide detailed responses for higher scoring</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p>Upload supporting documents when requested</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rating" className="space-y-6">
              <ScoreDisplay />
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Match Requests</CardTitle>
                  <CardDescription>
                    Investors who are interested in learning more about your company
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {matches.length === 0 ? (
                    <div className="text-center py-8">
                      <HandHeart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No Match Requests Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Complete your assessment to start receiving interest from investors
                      </p>
                      <Button onClick={() => setActiveTab('assessment')}>
                        Continue Assessment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {matches.map((match: any) => (
                        <Card key={match.id} className="border-2">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold mb-1">Impact Ventures Fund</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {match.requestMessage || 'Interested in learning more about your company'}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(match.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-right space-y-2">
                                <Badge variant={match.status === 'pending' ? 'default' : 'secondary'}>
                                  {match.status}
                                </Badge>
                                {match.status === 'pending' && (
                                  <div className="space-x-2">
                                    <Button size="sm" variant="outline">Decline</Button>
                                    <Button size="sm">Accept</Button>
                                  </div>
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
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>
                    Conversations with matched investors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Active Conversations</h3>
                    <p className="text-muted-foreground">
                      Messages will appear here once you accept match requests from investors
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Profile</CardTitle>
                  <CardDescription>
                    Manage your company information and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium">Company Name</label>
                        <p className="text-lg">{company?.companyName || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Sector</label>
                        <p className="text-lg">{company?.sector || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Stage</label>
                        <p className="text-lg">{company?.stage || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Location</label>
                        <p className="text-lg">{company?.location || 'Not specified'}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <p className="text-muted-foreground mt-1">
                        {company?.description || 'No description provided'}
                      </p>
                    </div>

                    {/* SDG Focus */}
                    <div>
                      <label className="text-sm font-medium">SDG Focus Areas</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {company?.sdgFocus?.length ? (
                          company.sdgFocus.map((sdg: string) => (
                            <Badge key={sdg} variant="secondary">{sdg}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No SDG focus areas selected</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 border-t">
                      <Button>Edit Profile</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Chat Widget */}
      <ChatWidget
        matchId={matches.find((m: any) => m.status === 'accepted')?.id}
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
      />
    </div>
  );
}
