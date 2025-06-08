import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QuestionRenderer } from './QuestionRenderer';
import { Question, QuestionnaireModule, CompanyResponse, QuestionnaireProgress } from '@/types/questionnaire';
import { apiRequest } from '@/lib/queryClient';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function QuestionnaireForm() {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<number, any>>(new Map());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: modules = [] } = useQuery({
    queryKey: ['/api/questionnaire/modules'],
  }) as { data: QuestionnaireModule[] };

  const { data: questions = [] } = useQuery({
    queryKey: ['/api/questionnaire/questions'],
  }) as { data: Question[] };

  const { data: existingResponses = [] } = useQuery({
    queryKey: ['/api/companies/responses'],
  }) as { data: CompanyResponse[] };

  const saveResponseMutation = useMutation({
    mutationFn: async (response: any) => {
      const res = await apiRequest('POST', '/api/companies/responses', response);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies/responses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/companies/score'] });
      toast({
        title: "Response saved",
        description: "Your answer has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving response",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Initialize responses from existing data
  useEffect(() => {
    if (existingResponses.length > 0) {
      const responseMap = new Map();
      existingResponses.forEach((response: CompanyResponse) => {
        responseMap.set(response.questionId, response.responseValue);
      });
      setResponses(responseMap);
    }
  }, [existingResponses]);

  // Get current module and questions
  const currentModule = modules[currentModuleIndex];
  const moduleQuestions = questions.filter((q: Question) => q.moduleId === currentModule?.id);
  const currentQuestion = moduleQuestions[currentQuestionIndex];

  // Calculate progress
  const calculateProgress = (): QuestionnaireProgress => {
    const totalQuestions = questions.length;
    const answeredQuestions = Array.from(responses.values()).filter(v => v && v !== '').length;
    const completionPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    const moduleProgress: any = {};
    modules.forEach((module: QuestionnaireModule) => {
      const moduleQuestions = questions.filter((q: Question) => q.moduleId === module.id);
      const moduleAnswered = moduleQuestions.filter((q: Question) => {
        const response = responses.get(q.id);
        return response && response !== '';
      }).length;

      moduleProgress[module.id] = {
        total: moduleQuestions.length,
        answered: moduleAnswered,
        percentage: moduleQuestions.length > 0 ? (moduleAnswered / moduleQuestions.length) * 100 : 0,
      };
    });

    return {
      totalQuestions,
      answeredQuestions,
      completionPercentage,
      moduleProgress,
    };
  };

  const progress = calculateProgress();

  const handleResponseChange = (questionId: number, value: any) => {
    const newResponses = new Map(responses);
    newResponses.set(questionId, value);
    setResponses(newResponses);

    // Auto-save response
    saveResponseMutation.mutate({
      questionId,
      responseValue: typeof value === 'string' ? value : JSON.stringify(value),
    });
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < moduleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      const prevModuleQuestions = questions.filter((q: Question) => q.moduleId === modules[currentModuleIndex - 1]?.id);
      setCurrentQuestionIndex(prevModuleQuestions.length - 1);
    }
  };

  const isLastQuestion = currentModuleIndex === modules.length - 1 && currentQuestionIndex === moduleQuestions.length - 1;
  const isFirstQuestion = currentModuleIndex === 0 && currentQuestionIndex === 0;

  if (!currentModule || !currentQuestion) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading questionnaire...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">TWIGA Impact Assessment</CardTitle>
              <CardDescription>
                Complete your comprehensive sustainability questionnaire to receive your TWIGA Rating
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Overall Progress</div>
              <div className="text-2xl font-bold text-primary">
                {Math.round(progress.completionPercentage)}%
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Progress value={progress.completionPercentage} className="w-full" />

            {/* Module Progress Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {modules.map((module: QuestionnaireModule) => {
                const moduleProgress = progress.moduleProgress[module.id];
                const isCurrentModule = module.id === currentModule.id;

                return (
                  <div
                    key={module.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      isCurrentModule ? 'border-primary bg-primary/5' : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">{module.name}</h3>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        moduleProgress?.percentage === 100
                          ? 'bg-green-100 text-green-700'
                          : isCurrentModule
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {moduleProgress?.percentage === 100 ? '✓' : moduleProgress?.answered || 0}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {moduleProgress?.answered || 0} of {moduleProgress?.total || 0} questions
                    </div>
                    <Progress value={moduleProgress?.percentage || 0} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-medium">
                  {currentQuestion.displayOrder}
                </div>
                {currentModule.name} Module
              </CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {moduleQuestions.length} • {currentModule.category}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Module Progress</div>
              <div className="text-lg font-semibold">
                {Math.round(progress.moduleProgress[currentModule.id]?.percentage || 0)}%
              </div>
            </div>
          </div>
          <Progress value={progress.moduleProgress[currentModule.id]?.percentage || 0} className="w-full" />
        </CardHeader>

        <CardContent className="space-y-6">
          <QuestionRenderer
            question={currentQuestion}
            value={responses.get(currentQuestion.id)}
            onChange={(value) => handleResponseChange(currentQuestion.id, value)}
          />

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={isFirstQuestion}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              Question {(currentModuleIndex * moduleQuestions.length) + currentQuestionIndex + 1} of {questions.length}
            </div>

            <Button
              onClick={goToNextQuestion}
              disabled={isLastQuestion}
              className="flex items-center gap-2"
            >
              {isLastQuestion ? 'Complete' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
