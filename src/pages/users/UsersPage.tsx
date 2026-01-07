import { useState } from 'react';
import { mockUsers } from '@/data/mockData';
import { User } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Phone, Smartphone, Trash2, Edit, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers.filter(u => u.role === 'user'));
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dailyLeadLimit: '20',
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: User['whatsappStatus']) => {
    switch (status) {
      case 'online': return 'bg-success';
      case 'connecting': return 'bg-warning';
      default: return 'bg-muted-foreground';
    }
  };

  const getStatusLabel = (status: User['whatsappStatus']) => {
    switch (status) {
      case 'online': return 'Online';
      case 'connecting': return 'Conectando';
      default: return 'Offline';
    }
  };

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      role: 'user',
      whatsappStatus: 'offline',
      dailyLeadLimit: parseInt(formData.dailyLeadLimit) || 20,
      leadsReceivedToday: 0,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);
    setFormData({ name: '', phone: '', dailyLeadLimit: '20' });
    setIsCreateOpen(false);
    
    toast({
      title: 'Usuário criado!',
      description: 'O usuário pode agora conectar seu WhatsApp.',
    });
  };

  const handleUpdate = () => {
    if (!editingUser) return;

    setUsers(prev =>
      prev.map(u =>
        u.id === editingUser.id
          ? {
              ...u,
              name: formData.name,
              phone: formData.phone,
              dailyLeadLimit: parseInt(formData.dailyLeadLimit) || 20,
            }
          : u
      )
    );
    
    setEditingUser(null);
    setFormData({ name: '', phone: '', dailyLeadLimit: '20' });
    
    toast({
      title: 'Usuário atualizado!',
    });
  };

  const handleDelete = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast({
      title: 'Usuário removido',
    });
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      phone: user.phone,
      dailyLeadLimit: user.dailyLeadLimit.toString(),
    });
  };

  const closeDialog = () => {
    setIsCreateOpen(false);
    setEditingUser(null);
    setFormData({ name: '', phone: '', dailyLeadLimit: '20' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerencie vendedores e consultores</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          if (!open) closeDialog();
          else setIsCreateOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="5511999999999"
                />
                <p className="text-xs text-muted-foreground">
                  Este número será usado para login via OTP
                </p>
              </div>
              <div className="space-y-2">
                <Label>Limite diário de leads</Label>
                <Input
                  type="number"
                  value={formData.dailyLeadLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, dailyLeadLimit: e.target.value }))}
                  min="1"
                  max="999"
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Adicionar Usuário
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
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
              <Label>WhatsApp</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Limite diário de leads</Label>
              <Input
                type="number"
                value={formData.dailyLeadLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, dailyLeadLimit: e.target.value }))}
                min="1"
                max="999"
              />
            </div>
            <Button onClick={handleUpdate} className="w-full">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {users.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center text-center">
            <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum usuário</h3>
            <p className="text-muted-foreground mb-4">
              Adicione vendedores para receber leads automaticamente
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar primeiro usuário
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(user.whatsappStatus)}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{user.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant={user.whatsappStatus === 'online' ? 'default' : 'secondary'}
                        className="gap-1"
                      >
                        <Smartphone className="h-3 w-3" />
                        {getStatusLabel(user.whatsappStatus)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Leads hoje</span>
                    <span className="font-medium">
                      {user.leadsReceivedToday} / {user.dailyLeadLimit}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => openEdit(user)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(user.id)}
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
