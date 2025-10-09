'use client';

import { Home, FileText, Activity, DollarSign, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarHeader,
  SidebarFooter,
} from '@repo/ui/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeSection: string;
}

export default function DashboardLayout({
  children,
  activeSection,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'overview', title: 'Overview', icon: Home, path: '/dashboard' },
    {
      id: 'content',
      title: 'Content Library',
      icon: FileText,
      path: '/dashboard/content',
    },
    {
      id: 'usage',
      title: 'Usage Analytics',
      icon: Activity,
      path: '/dashboard/usage',
    },
    {
      id: 'revenue',
      title: 'Revenue & Payments',
      icon: DollarSign,
      path: '/dashboard/revenue',
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const style = {
    '--sidebar-width': '16rem',
    '--sidebar-width-icon': '3rem',
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-gradient-to-br from-primary to-chart-2" />
              <div className="flex flex-col">
                <span className="font-heading text-sm font-bold text-foreground">
                  Kingdom Connect
                </span>
                <span className="text-xs text-muted-foreground">
                  Publisher Portal
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => router.push(item.path)}
                          isActive={activeSection === item.id}
                          data-testid={`nav-${item.id}`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Publisher</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 text-sm">
                  <div className="font-medium text-foreground">
                    {user?.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user?.organization}
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  data-testid="button-sidebar-logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
