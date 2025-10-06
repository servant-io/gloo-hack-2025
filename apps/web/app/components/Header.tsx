'use client';

import { Button } from '@repo/ui/button';
import { LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-gradient-to-br from-primary to-chart-2" />
            <span className="font-heading text-xl font-bold text-foreground">
              ContentMeter
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user?.name}
                </span>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  data-testid="button-dashboard"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => router.push('/login')}
                data-testid="button-login"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Publisher Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
