import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Quiz, QuizStep, QuizQuestion, QuestionType } from '@/types/crm';
import { mockQuizzes } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  GripVertical, 
  Type, 
  Hash, 
  List, 
  ToggleLeft, 
  Save,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const questionTypeIcons: Record<QuestionType, typeof Type> = {
  text: Type,
  number: Hash,
  multiple_choice: List,
  yes_no: ToggleLeft,
};

const questionTypeLabels: Record<QuestionType, string> = {
  text: 'Texto',
  number: 'Número',
  multiple_choice: 'Múltipla Escolha',
  yes_no: 'Sim/Não',
};

function SortableStep({
  step,
  onUpdate,
  onDelete,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}: {
  step: QuizStep;
  onUpdate: (data: Partial<QuizStep>) => void;
  onDelete: () => void;
  onAddQuestion: () => void;
  onUpdateQuestion: (questionId: string, data: Partial<QuizQuestion>) => void;
  onDeleteQuestion: (questionId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: step.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <AccordionItem 
      ref={setNodeRef} 
      style={style} 
      value={step.id}
      className="border rounded-lg mb-3"
    >
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-3 flex-1">
          <div {...attributes} {...listeners} className="cursor-grab">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <Badge variant="outline" className="shrink-0">Etapa {step.order}</Badge>
          <span className="font-medium truncate">{step.title || 'Sem título'}</span>
          <span className="text-xs text-muted-foreground ml-auto mr-4">
            {step.questions.length} pergunta(s)
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Título da Etapa</Label>
            <Input
              value={step.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Ex: Dados Pessoais"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Perguntas</Label>
              <Button size="sm" variant="outline" onClick={onAddQuestion} className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                Adicionar
              </Button>
            </div>

            {step.questions.map((question, qIndex) => {
              const Icon = questionTypeIcons[question.type];
              return (
                <Card key={question.id} className="p-3">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Badge variant="secondary" className="shrink-0 gap-1">
                          <Icon className="h-3 w-3" />
                          {questionTypeLabels[question.type]}
                        </Badge>
                        <Input
                          value={question.question}
                          onChange={(e) => onUpdateQuestion(question.id, { question: e.target.value })}
                          placeholder="Digite a pergunta..."
                          className="flex-1"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteQuestion(question.id)}
                        className="shrink-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <Select
                        value={question.type}
                        onValueChange={(value: QuestionType) => 
                          onUpdateQuestion(question.id, { type: value })
                        }
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto</SelectItem>
                          <SelectItem value="number">Número</SelectItem>
                          <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                          <SelectItem value="yes_no">Sim/Não</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={question.required}
                          onCheckedChange={(checked) => 
                            onUpdateQuestion(question.id, { required: checked })
                          }
                        />
                        <span className="text-sm text-muted-foreground">Obrigatória</span>
                      </div>
                    </div>

                    {question.type === 'multiple_choice' && (
                      <div className="space-y-2">
                        <Label className="text-xs">Opções (uma por linha)</Label>
                        <Textarea
                          value={question.options?.join('\n') || ''}
                          onChange={(e) => 
                            onUpdateQuestion(question.id, { 
                              options: e.target.value.split('\n').filter(Boolean) 
                            })
                          }
                          placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}

            {step.questions.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Nenhuma pergunta nesta etapa
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Etapa
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function QuizEditorPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quiz, setQuiz] = useState<Quiz | null>(() => {
    return mockQuizzes.find(q => q.id === quizId) || null;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Quiz não encontrado</h2>
          <Button onClick={() => navigate('/quizzes')}>Voltar para lista</Button>
        </div>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setQuiz(prev => {
      if (!prev) return prev;
      const oldIndex = prev.steps.findIndex(s => s.id === active.id);
      const newIndex = prev.steps.findIndex(s => s.id === over.id);
      
      const newSteps = arrayMove(prev.steps, oldIndex, newIndex).map((step, idx) => ({
        ...step,
        order: idx + 1,
      }));

      return { ...prev, steps: newSteps };
    });
  };

  const addStep = () => {
    setQuiz(prev => {
      if (!prev) return prev;
      const newStep: QuizStep = {
        id: `step-${Date.now()}`,
        order: prev.steps.length + 1,
        title: '',
        questions: [],
      };
      return { ...prev, steps: [...prev.steps, newStep] };
    });
  };

  const updateStep = (stepId: string, data: Partial<QuizStep>) => {
    setQuiz(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps.map(s => (s.id === stepId ? { ...s, ...data } : s)),
      };
    });
  };

  const deleteStep = (stepId: string) => {
    setQuiz(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps
          .filter(s => s.id !== stepId)
          .map((s, idx) => ({ ...s, order: idx + 1 })),
      };
    });
  };

  const addQuestion = (stepId: string) => {
    setQuiz(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps.map(step => {
          if (step.id !== stepId) return step;
          const newQuestion: QuizQuestion = {
            id: `q-${Date.now()}`,
            stepId,
            order: step.questions.length + 1,
            type: 'text',
            question: '',
            required: true,
          };
          return { ...step, questions: [...step.questions, newQuestion] };
        }),
      };
    });
  };

  const updateQuestion = (stepId: string, questionId: string, data: Partial<QuizQuestion>) => {
    setQuiz(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps.map(step => {
          if (step.id !== stepId) return step;
          return {
            ...step,
            questions: step.questions.map(q => 
              q.id === questionId ? { ...q, ...data } : q
            ),
          };
        }),
      };
    });
  };

  const deleteQuestion = (stepId: string, questionId: string) => {
    setQuiz(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps.map(step => {
          if (step.id !== stepId) return step;
          return {
            ...step,
            questions: step.questions
              .filter(q => q.id !== questionId)
              .map((q, idx) => ({ ...q, order: idx + 1 })),
          };
        }),
      };
    });
  };

  const saveQuiz = () => {
    toast({
      title: 'Quiz salvo!',
      description: 'Todas as alterações foram salvas.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/quizzes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-muted-foreground text-sm">Editor de Quiz</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/q/${quiz.slug}`)} className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button onClick={saveQuiz} className="gap-2">
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Etapas do Quiz</CardTitle>
                <Button onClick={addStep} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Nova Etapa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {quiz.steps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-4">Nenhuma etapa criada</p>
                  <Button onClick={addStep} variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar primeira etapa
                  </Button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={quiz.steps.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Accordion type="single" collapsible className="w-full">
                      {quiz.steps.map((step) => (
                        <SortableStep
                          key={step.id}
                          step={step}
                          onUpdate={(data) => updateStep(step.id, data)}
                          onDelete={() => deleteStep(step.id)}
                          onAddQuestion={() => addQuestion(step.id)}
                          onUpdateQuestion={(qId, data) => updateQuestion(step.id, qId, data)}
                          onDeleteQuestion={(qId) => deleteQuestion(step.id, qId)}
                        />
                      ))}
                    </Accordion>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={quiz.title}
                  onChange={(e) => setQuiz(prev => prev ? { ...prev, title: e.target.value } : prev)}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={quiz.description}
                  onChange={(e) => setQuiz(prev => prev ? { ...prev, description: e.target.value } : prev)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input
                  value={quiz.slug}
                  onChange={(e) => setQuiz(prev => prev ? { ...prev, slug: e.target.value } : prev)}
                />
                <p className="text-xs text-muted-foreground">
                  /q/{quiz.slug}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <Label>Publicado</Label>
                <Switch
                  checked={quiz.isPublished}
                  onCheckedChange={(checked) => 
                    setQuiz(prev => prev ? { ...prev, isPublished: checked } : prev)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Etapas</span>
                <span className="font-medium">{quiz.steps.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Perguntas</span>
                <span className="font-medium">
                  {quiz.steps.reduce((acc, s) => acc + s.questions.length, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={quiz.isPublished ? 'default' : 'secondary'}>
                  {quiz.isPublished ? 'Publicado' : 'Rascunho'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
