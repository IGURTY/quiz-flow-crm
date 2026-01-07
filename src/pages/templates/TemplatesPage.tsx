import { useState } from 'react';
import { mockMessageTemplates } from '@/data/mockData';
import { MessageTemplate } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, MessageSquare, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<MessageTemplate[]>(mockMessageTemplates);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    isDefault: false,
  });

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    const newTemplate: MessageTemplate = {
      id: `t-${Date.now()}`,
      name: formData.name,
      content: formData.content,
      isDefault: formData.isDefault,
      createdAt: new Date().toISOString(),
    };

    // If setting as default, unset others
    if (formData.isDefault) {
      setTemplates(prev => prev.map(t => ({ ...t, isDefault: false })));
    }

    setTemplates(prev => [...prev, newTemplate]);
    closeDialog();
    
    toast({
      title: 'Template criado!',
    });
  };

  const handleUpdate = () => {
    if (!editingTemplate) return;

    // If setting as default, unset others
    if (formData.isDefault) {
      setTemplates(prev => prev.map(t => ({ ...t, isDefault: t.id === editingTemplate.id })));
    }

    setTemplates(prev =>
      prev.map(t =>
        t.id === editingTemplate.id
          ? { ...t, name: formData.name, content: formData.content, isDefault: formData.isDefault }
          : t
      )
    );
    
    closeDialog();
    toast({ title: 'Template atualizado!' });
  };

  const handleDelete = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast({ title: 'Template removido' });
  };

  const openEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      content: template.content,
      isDefault: template.isDefault,
    });
  };

  const closeDialog = () => {
    setIsCreateOpen(false);
    setEditingTemplate(null);
    setFormData({ name: '', content: '', isDefault: false });
  };

  const copyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copiado!' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates de Mensagem</h1>
          <p className="text-muted-foreground">Crie mensagens automáticas para envio via WhatsApp</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          if (!open) closeDialog();
          else setIsCreateOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Boas-vindas"
                />
              </div>
              <div className="space-y-2">
                <Label>Mensagem *</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Olá {{nome}}! Bem-vindo..."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{{nome}}"}, {"{{vendedor}}"} para variáveis dinâmicas
                </p>
              </div>
              <div className="flex items-center justify-between">
                <Label>Template padrão</Label>
                <Switch
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Criar Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={5}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Template padrão</Label>
              <Switch
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
              />
            </div>
            <Button onClick={handleUpdate} className="w-full">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {templates.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum template</h3>
            <p className="text-muted-foreground mb-4">
              Crie templates de mensagem para automatizar o contato
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar primeiro template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  {template.isDefault && (
                    <Badge>Padrão</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted rounded-lg text-sm mb-4 whitespace-pre-wrap">
                  {template.content}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyTemplate(template.content)}
                    className="gap-1"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(template)}
                    className="gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
