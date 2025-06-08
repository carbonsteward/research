import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CompanyScore } from '@/types/questionnaire';
import { TrendingUp, Lock, Award, Target } from 'lucide-react';

export function ScoreDisplay() {
  const { data: score, isLoading } = useQuery<CompanyScore>({
    queryKey: ['/api/companies/score'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading scores...</div>
        </CardContent>
      </Card>
    );
  }

  if (!score) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Lock className="w-8 h-8 mx-auto mb-2" />
            <p>Complete your assessment to see your TWIGA Rating</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const disclosureScore = parseFloat(score.disclosureScore || '0');
  const zebraScoreEconomic = parseFloat(score.zebraScoreEconomic || '0');
  const zebraScoreSocial = parseFloat(score.zebraScoreSocial || '0');
  const zebraScoreBiosphere = parseFloat(score.zebraScoreBiosphere || '0');
  const overallScore = parseFloat(score.overallScore || '0');
  const completionPercentage = parseFloat(score.completionPercentage || '0');

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'High Match', variant: 'default' as const, className: 'bg-green-100 text-green-800' };
    if (score >= 80) return { label: 'Recommend', variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800' };
    if (score >= 70) return { label: 'Reviewable', variant: 'outline' as const, className: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Progress', variant: 'outline' as const, className: 'bg-gray-100 text-gray-800' };
  };

  const overallBadge = getScoreBadge(overallScore);

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <Card className="twiga-gradient text-white">
        <CardHeader>
          <CardTitle className="text-white">Your TWIGA Rating</CardTitle>
          <CardDescription className="text-white/80">
            Your comprehensive sustainability assessment score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold mb-2">
                {Math.round(overallScore)}%
              </div>
              <Badge className={overallBadge.className}>
                {overallBadge.label}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-white/80 mb-2">Assessment Progress</div>
              <div className="text-xl font-semibold mb-2">
                {Math.round(completionPercentage)}%
              </div>
              <Progress
                value={completionPercentage}
                className="bg-white/20 [&>div]:bg-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Disclosure Score */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-5 h-5 text-primary" />
              Disclosure Score
            </CardTitle>
            <CardDescription>
              Measures completeness and transparency of responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-primary">
                  {Math.round(disclosureScore)}%
                </span>
                <span className="text-sm text-muted-foreground">
                  {disclosureScore >= 70 ? 'Eligible for Zebra Scores' : 'Complete 70% to unlock Zebra Scores'}
                </span>
              </div>
              <Progress value={disclosureScore} />
              <p className="text-xs text-muted-foreground">
                Minimum 70% required to unlock Zebra Score calculations
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Zebra Scores */}
        {disclosureScore >= 70 ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="w-5 h-5 text-secondary" />
                Zebra Scores
              </CardTitle>
              <CardDescription>
                Impact performance across key dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Economic Impact</span>
                    <span className={`text-sm font-bold ${getScoreColor(zebraScoreEconomic)}`}>
                      {Math.round(zebraScoreEconomic)}%
                    </span>
                  </div>
                  <Progress value={zebraScoreEconomic} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Social Impact</span>
                    <span className={`text-sm font-bold ${getScoreColor(zebraScoreSocial)}`}>
                      {Math.round(zebraScoreSocial)}%
                    </span>
                  </div>
                  <Progress value={zebraScoreSocial} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Biosphere Impact</span>
                    <span className={`text-sm font-bold ${getScoreColor(zebraScoreBiosphere)}`}>
                      {Math.round(zebraScoreBiosphere)}%
                    </span>
                  </div>
                  <Progress value={zebraScoreBiosphere} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-2">Zebra Scores Locked</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Complete at least 70% of the disclosure questions to unlock your impact scores
              </p>
              <Progress value={disclosureScore} className="mb-2" />
              <p className="text-xs text-muted-foreground">
                {Math.round(disclosureScore)}% / 70% required
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Score Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Understanding Your TWIGA Rating
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Disclosure Score</h4>
              <p className="text-sm text-muted-foreground">
                Measures the completeness and transparency of your responses. A higher disclosure score
                indicates more comprehensive information sharing, which builds trust with investors.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Zebra Scores</h4>
              <p className="text-sm text-muted-foreground">
                Evaluate your actual impact performance across Economic, Social, and Biosphere dimensions.
                These scores reflect the quality and magnitude of your sustainability initiatives.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Rating Levels</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="text-center">
                <div className="w-4 h-4 bg-green-500 rounded mx-auto mb-1"></div>
                <div className="font-medium">High Match</div>
                <div className="text-muted-foreground">90%+</div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-blue-500 rounded mx-auto mb-1"></div>
                <div className="font-medium">Recommend</div>
                <div className="text-muted-foreground">80-89%</div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mx-auto mb-1"></div>
                <div className="font-medium">Reviewable</div>
                <div className="text-muted-foreground">70-79%</div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-gray-400 rounded mx-auto mb-1"></div>
                <div className="font-medium">In Progress</div>
                <div className="text-muted-foreground">&lt;70%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
