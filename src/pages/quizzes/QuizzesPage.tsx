import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quiz, QuizStep, QuizQuestion, QuestionType } from '@/types/crm';
import { mockQuizzes } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Eye, Copy, Trash2, ExternalLink, FileQuestion } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function QuizzesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizDescription, setNewQuizDescription] = useState('');

  const handleCreateQuiz = () => {
    if (!newQuizTitle.trim()) return;

    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: newQuizTitle,
      description: newQuizDescription,
      slug: newQuizTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      isPublished: false,
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setQuizzes(prev => [...prev, newQuiz]);
    setNewQuizTitle('');
    setNewQuizDescription('');
    setIsCreateOpen(false);
    
    toast({
      title: 'Quiz criado!',
      description: 'Agora adicione as etapas e perguntas.',
    });

    navigate(`/quizzes/${newQuiz.id}`);
  };

  const togglePublish = (quizId: string) => {
    setQuizzes(prev =>
      prev.map(q =>
        q.id === quizId ? { ...q, isPublished: !q.isPublished } : q
      )
    );
  };

  const copyLink = (slug: string) => {
    const link = `${window.location.origin}/q/${slug}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link copiado!',
      description: 'O link do quiz foi copiado para a área de transferência.',
    });
  };

  const deleteQuiz = (quizId: string) => {
    setQuizzes(prev => prev.filter(q => q.id !== quizId));
    toast({
      title: 'Quiz excluído',
      description: 'O quiz foi removido do sistema.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quiz Builder</h1>
          <p className="text-muted-foreground">Crie e gerencie seus formulários de captação</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Quiz
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <Input
                  placeholder="Ex: Captação de Leads - Imóveis"
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição (opcional)</label>
                <Input
                  placeholder="Descreva o objetivo deste quiz"
                  value={newQuizDescription}
                  onChange={(e) => setNewQuizDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateQuiz} className="w-full">
                Criar Quiz
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {quizzes.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center text-center">
            <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum quiz criado</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro quiz para começar a captar leads
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{quiz.title}</CardTitle>
                    {quiz.description && (
                      <CardDescription className="line-clamp-2 mt-1">
                        {quiz.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant={quiz.isPublished ? 'default' : 'secondary'}>
                    {quiz.isPublished ? 'Publicado' : 'Rascunho'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span>{quiz.steps.length} etapas</span>
                  <span>
                    {quiz.steps.reduce((acc, step) => acc + step.questions.length, 0)} perguntas
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm">Publicar</span>
                  <Switch
                    checked={quiz.isPublished}
                    onCheckedChange={() => togglePublish(quiz.id)}
                  />
                </div>

                <div className="flex flex-wrap gap-2 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/quizzes/${quiz.id}`)}
                    className="gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/q/${quiz.slug}`)}
                    className="gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyLink(quiz.slug)}
                    className="gap-1"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copiar Link
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteQuiz(quiz.id)}
                    className="gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Atualizado em {format(new Date(quiz.updatedAt), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
