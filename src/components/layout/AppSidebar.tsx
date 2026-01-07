import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileQuestion,
  Users,
  Kanban,
  MessageSquare,
  Settings,
  LogOut,
  Moon,
  Sun,
  Smartphone,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const adminMenuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Quiz Builder', url: '/quizzes', icon: FileQuestion },
  { title: 'Leads', url: '/leads', icon: Kanban },
  { title: 'Usuários', url: '/users', icon: Users },
  { title: 'WhatsApp', url: '/whatsapp', icon: Smartphone },
  { title: 'Templates', url: '/templates', icon: MessageSquare },
  { title: 'Configurações', url: '/settings', icon: Settings },
];

const userMenuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Meus Leads', url: '/leads', icon: Kanban },
  { title: 'WhatsApp', url: '/whatsapp', icon: Smartphone },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';

  const menuItems = user?.role === 'admin' ? adminMenuItems : userMenuItems;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getWhatsAppStatusColor = () => {
    switch (user?.whatsappStatus) {
      case 'online':
        return 'bg-success';
      case 'connecting':
        return 'bg-warning';
      default:
        return 'bg-muted-foreground';
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            CRM
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">QuizLead</span>
              <span className="text-xs text-sidebar-foreground/60">CRM Automático</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          onClick={toggleTheme}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          {!collapsed && <span className="ml-3">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
        </Button>

        {/* User Info */}
        {user && (
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="relative">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span 
                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-sidebar ${getWhatsAppStatusColor()}`} 
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</span>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {user.role === 'admin' ? 'Admin' : 'Vendedor'}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Logout Button */}
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          onClick={logout}
          className="w-full justify-start text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-3">Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
