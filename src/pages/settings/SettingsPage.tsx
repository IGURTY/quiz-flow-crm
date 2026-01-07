import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings, Bell, Users, Zap } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: 'Configurações salvas!',
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Distribuição de Leads
          </CardTitle>
          <CardDescription>
            Configure como os leads serão distribuídos entre os vendedores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Método de Distribuição</Label>
            <Select defaultValue="round-robin">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round-robin">Round-robin (alternado)</SelectItem>
                <SelectItem value="priority">Por prioridade</SelectItem>
                <SelectItem value="availability">Por disponibilidade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Verificar WhatsApp ativo</Label>
              <p className="text-xs text-muted-foreground">
                Só distribui para usuários com WhatsApp conectado
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Respeitar limite diário</Label>
              <p className="text-xs text-muted-foreground">
                Não excede o limite de leads por dia do usuário
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Fallback automático</Label>
              <p className="text-xs text-muted-foreground">
                Redistribui se o usuário não estiver disponível
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automação
          </CardTitle>
          <CardDescription>
            Configure ações automáticas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Envio automático de boas-vindas</Label>
              <p className="text-xs text-muted-foreground">
                Envia mensagem automática ao receber novo lead
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Remarketing automático</Label>
              <p className="text-xs text-muted-foreground">
                Envia follow-up para leads sem atividade
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label>Tempo para remarketing (dias)</Label>
            <Input type="number" defaultValue="1" min="1" max="30" className="w-32" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure as notificações do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Notificar novo lead</Label>
              <p className="text-xs text-muted-foreground">
                Avisa o vendedor quando receber um novo lead
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Notificar WhatsApp offline</Label>
              <p className="text-xs text-muted-foreground">
                Avisa quando a conexão WhatsApp cair
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Salvar Configurações</Button>
      </div>
    </div>
  );
}
