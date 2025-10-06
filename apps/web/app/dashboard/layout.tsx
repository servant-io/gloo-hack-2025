'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { usePathname } from 'next/navigation';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getActiveSection = () => {
    if (pathname === '/dashboard') return 'overview';
    if (pathname.startsWith('/dashboard/content')) return 'content';
    if (pathname.startsWith('/dashboard/usage')) return 'usage';
    if (pathname.startsWith('/dashboard/revenue')) return 'revenue';
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
