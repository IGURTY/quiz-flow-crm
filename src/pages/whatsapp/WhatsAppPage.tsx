import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, QrCode, RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function WhatsAppPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [evolutionUrl, setEvolutionUrl] = useState('');
  const [evolutionKey, setEvolutionKey] = useState('');

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate QR code generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setShowQR(true);
    setIsConnecting(false);
  };

  const handleDisconnect = () => {
    setShowQR(false);
    toast({
      title: 'WhatsApp desconectado',
      description: 'A sessão foi encerrada.',
    });
  };

  const handleSaveConfig = () => {
    if (!evolutionUrl.trim() || !evolutionKey.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha a URL e API Key da Evolution API.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Configuração salva!',
      description: 'A Evolution API foi configurada com sucesso.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">WhatsApp</h1>
        <p className="text-muted-foreground">
          {isAdmin ? 'Configure a integração com Evolution API' : 'Gerencie sua conexão WhatsApp'}
        </p>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuração Evolution API</CardTitle>
            <CardDescription>
              Configure os dados de conexão com sua instância da Evolution API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL da API</label>
              <Input
                placeholder="https://sua-evolution-api.com"
                value={evolutionUrl}
                onChange={(e) => setEvolutionUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <Input
                type="password"
                placeholder="••••••••••••••••"
                value={evolutionKey}
                onChange={(e) => setEvolutionKey(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveConfig}>Salvar Configuração</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            {isAdmin ? 'Status das Conexões' : 'Meu WhatsApp'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-muted-foreground" />
                </div>
                <span
                  className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background ${
                    user?.whatsappStatus === 'online'
                      ? 'bg-success'
                      : user?.whatsappStatus === 'connecting'
                      ? 'bg-warning'
                      : 'bg-muted-foreground'
                  }`}
                />
              </div>
              <div>
                <p className="font-medium">{user?.phone}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={user?.whatsappStatus === 'online' ? 'default' : 'secondary'}
                    className="gap-1"
                  >
                    {user?.whatsappStatus === 'online' ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Conectado
                      </>
                    ) : user?.whatsappStatus === 'connecting' ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Conectando
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        Desconectado
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {user?.whatsappStatus === 'online' ? (
                <Button variant="outline" onClick={handleDisconnect}>
                  Desconectar
                </Button>
              ) : (
                <Button onClick={handleConnect} disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando QR...
                    </>
                  ) : (
                    <>
                      <QrCode className="mr-2 h-4 w-4" />
                      Conectar
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {showQR && (
            <div className="mt-6 p-6 border rounded-lg text-center">
              <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <QrCode className="h-24 w-24 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">QR Code Demo</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Abra o WhatsApp no seu celular, vá em <strong>Dispositivos Conectados</strong> e escaneie o QR Code
              </p>
              <Button variant="outline" size="sm" onClick={handleConnect} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Gerar novo código
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
