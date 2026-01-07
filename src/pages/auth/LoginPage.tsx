import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Smartphone } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginAdmin, loginWithOTP, requestOTP, isLoading } = useAuth();
  const { toast } = useToast();

  // Admin login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP login state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginAdmin(email, password);
    if (success) {
      toast({
        title: 'Login realizado!',
        description: 'Bem-vindo de volta.',
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Erro no login',
        description: 'Email ou senha incorretos.',
        variant: 'destructive',
      });
    }
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await requestOTP(phone);
    if (success) {
      setOtpSent(true);
      toast({
        title: 'Código enviado!',
        description: 'Verifique seu WhatsApp.',
      });
    } else {
      toast({
        title: 'Erro',
        description: 'Número não encontrado no sistema.',
        variant: 'destructive',
      });
    }
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginWithOTP(phone, otp);
    if (success) {
      toast({
        title: 'Login realizado!',
        description: 'Bem-vindo de volta.',
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Código inválido',
        description: 'Verifique o código e tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl mb-4">
            CRM
          </div>
          <h1 className="text-2xl font-bold">QuizLead CRM</h1>
          <p className="text-muted-foreground mt-1">Sistema de captação automática de leads</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Entrar</CardTitle>
            <CardDescription>Escolha como deseja acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="admin" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="user" className="gap-2">
                  <Smartphone className="h-4 w-4" />
                  Vendedor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar como Admin
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Demo: admin@empresa.com / admin123
                </p>
              </TabsContent>

              <TabsContent value="user">
                {!otpSent ? (
                  <form onSubmit={handleRequestOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="5511999999999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Digite o número com DDD, sem espaços
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Enviar código via WhatsApp
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleOTPLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp">Código OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Digite o código de 6 dígitos enviado para seu WhatsApp
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Verificar e Entrar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setOtpSent(false)}
                    >
                      Voltar
                    </Button>
                  </form>
                )}
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Demo: 5511988888888 / código: 123456
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
