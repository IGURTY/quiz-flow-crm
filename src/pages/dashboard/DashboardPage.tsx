import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockLeads, mockUsers } from '@/data/mockData';
import { Users, TrendingUp, Target, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { KANBAN_COLUMNS } from '@/types/crm';

const weeklyData = [
  { name: 'Seg', leads: 12 },
  { name: 'Ter', leads: 19 },
  { name: 'Qua', leads: 8 },
  { name: 'Qui', leads: 15 },
  { name: 'Sex', leads: 22 },
  { name: 'Sáb', leads: 5 },
  { name: 'Dom', leads: 3 },
];

const COLORS = ['hsl(199, 89%, 48%)', 'hsl(38, 92%, 50%)', 'hsl(221, 83%, 53%)', 'hsl(280, 65%, 60%)', 'hsl(142, 71%, 45%)', 'hsl(0, 84%, 60%)'];

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const filteredLeads = isAdmin 
    ? mockLeads 
    : mockLeads.filter(l => l.assignedUserId === user?.id);

  const totalLeads = filteredLeads.length;
  const closedLeads = filteredLeads.filter(l => l.status === 'fechado').length;
  const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

  const leadsByStatus = KANBAN_COLUMNS.map(col => ({
    name: col.label,
    value: filteredLeads.filter(l => l.status === col.id).length,
  }));

  const leadsByUser = isAdmin
    ? mockUsers
        .filter(u => u.role === 'user')
        .map(u => ({
          name: u.name.split(' ')[0],
          leads: mockLeads.filter(l => l.assignedUserId === u.id).length,
        }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {isAdmin ? 'Visão geral do sistema' : `Olá, ${user?.name}!`}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-success" />
              <span className="text-success">+12%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-success" />
              <span className="text-success">+5%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fechados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedLeads}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-destructive" />
              <span className="text-destructive">-2%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Projetado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 1.2M</div>
            <p className="text-xs text-muted-foreground">
              Baseado em propostas ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads por Semana</CardTitle>
            <CardDescription>Novos leads captados nos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads por Status</CardTitle>
            <CardDescription>Distribuição atual no funil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  >
                    {leadsByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin: Leads by User */}
      {isAdmin && leadsByUser.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Leads por Vendedor</CardTitle>
            <CardDescription>Distribuição de leads entre a equipe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadsByUser} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Bar dataKey="leads" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
