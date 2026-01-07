import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockQuizzes } from '@/data/mockData';
import { QuizAnswer } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function PublicQuizPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const quiz = mockQuizzes.find(q => q.slug === slug);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">Quiz não encontrado</h2>
            <p className="text-muted-foreground">Este quiz não existe ou foi removido.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz.isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">Quiz não disponível</h2>
            <p className="text-muted-foreground">Este quiz ainda não foi publicado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const step = quiz.steps[currentStep];
  const totalSteps = quiz.steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleAnswer = (questionId: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const canProceed = () => {
    if (!step) return false;
    return step.questions.every(q => {
      if (!q.required) return true;
      const answer = answers[q.id];
      return answer !== undefined && answer !== '';
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Here we would send to the backend
    console.log('Quiz submitted:', {
      quizId: quiz.id,
      answers,
      utms: {
        source: new URLSearchParams(window.location.search).get('utm_source'),
        medium: new URLSearchParams(window.location.search).get('utm_medium'),
        campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
      },
    });

    setIsSubmitted(true);
    toast({
      title: 'Respostas enviadas!',
      description: 'Em breve entraremos em contato.',
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Obrigado!</h2>
            <p className="text-muted-foreground">
              Suas respostas foram enviadas com sucesso. Nossa equipe entrará em contato em breve via WhatsApp.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>{quiz.title}</CardTitle>
            {quiz.description && (
              <CardDescription>{quiz.description}</CardDescription>
            )}
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-sm">
                <span>Etapa {currentStep + 1} de {totalSteps}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {step && (
              <>
                <h3 className="font-semibold text-lg">{step.title}</h3>
                
                <div className="space-y-6">
                  {step.questions.map((question) => (
                    <div key={question.id} className="space-y-3">
                      <Label className="text-base">
                        {question.question}
                        {question.required && <span className="text-destructive ml-1">*</span>}
                      </Label>

                      {question.type === 'text' && (
                        <Input
                          value={(answers[question.id] as string) || ''}
                          onChange={(e) => handleAnswer(question.id, e.target.value)}
                          placeholder="Digite sua resposta..."
                        />
                      )}

                      {question.type === 'number' && (
                        <Input
                          type="number"
                          value={(answers[question.id] as number) || ''}
                          onChange={(e) => handleAnswer(question.id, Number(e.target.value))}
                          placeholder="Digite um número..."
                        />
                      )}

                      {question.type === 'multiple_choice' && question.options && (
                        <RadioGroup
                          value={(answers[question.id] as string) || ''}
                          onValueChange={(value) => handleAnswer(question.id, value)}
                          className="space-y-2"
                        >
                          {question.options.map((option, idx) => (
                            <div key={idx} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer">
                              <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
                              <Label htmlFor={`${question.id}-${idx}`} className="cursor-pointer flex-1">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}

                      {question.type === 'yes_no' && (
                        <RadioGroup
                          value={(answers[question.id] as string) || ''}
                          onValueChange={(value) => handleAnswer(question.id, value)}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer flex-1">
                            <RadioGroupItem value="sim" id={`${question.id}-sim`} />
                            <Label htmlFor={`${question.id}-sim`} className="cursor-pointer">Sim</Label>
                          </div>
                          <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer flex-1">
                            <RadioGroupItem value="nao" id={`${question.id}-nao`} />
                            <Label htmlFor={`${question.id}-nao`} className="cursor-pointer">Não</Label>
                          </div>
                        </RadioGroup>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2"
              >
                {currentStep === totalSteps - 1 ? 'Enviar' : 'Próximo'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Powered by QuizLead CRM
        </p>
      </div>
    </div>
  );
}
