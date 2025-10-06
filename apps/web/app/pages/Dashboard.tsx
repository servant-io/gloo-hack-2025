'use client';

import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

interface DashboardProps {
  children: React.ReactNode;
}

export default function Dashboard({ children }: DashboardProps) {
  const [location] = useLocation();

  const getActiveSection = () => {
    if (location === '/dashboard') return 'overview';
    if (location.startsWith('/dashboard/content')) return 'content';
    if (location.startsWith('/dashboard/usage')) return 'usage';
    if (location.startsWith('/dashboard/revenue')) return 'revenue';
    return 'overview';
  };

  return (
    <ProtectedRoute>
      <DashboardLayout activeSection={getActiveSection()}>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
