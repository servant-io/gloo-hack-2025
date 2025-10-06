'use client';

import { Card } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { useAuth } from '@/lib/auth';
import { mockPublisherData } from '@/lib/mockData';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/table';

export default function Revenue() {
  const { user } = useAuth();
  const data = user
    ? mockPublisherData[user.id as keyof typeof mockPublisherData]
    : null;

  if (!data) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          Revenue & Payments
        </h1>
        <p className="text-muted-foreground">
          Track earnings and payment history
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6" data-testid="card-pending-payout">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-md bg-chart-2/10">
              <Clock className="h-5 w-5 text-chart-2" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">
                Pending Payout
              </div>
              <div className="font-heading text-2xl font-bold text-foreground">
                ${data.pendingPayout.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Next payout: Oct 31, 2024
          </div>
        </Card>

        <Card className="p-6" data-testid="card-total-paid">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-md bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">
                Total Paid Out
              </div>
              <div className="font-heading text-2xl font-bold text-foreground">
                ${(data.totalEarnings - data.pendingPayout).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Across {data.payments.length} payments
          </div>
        </Card>

        <Card className="p-6" data-testid="card-avg-monthly">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-md bg-chart-3/10">
              <TrendingUp className="h-5 w-5 text-chart-3" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Avg. Monthly</div>
              <div className="font-heading text-2xl font-bold text-foreground">
                ${(data.totalEarnings / 3).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Based on last 3 months
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-6">
          Payment History
        </h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.payments.map((payment, idx) => (
                <TableRow
                  key={payment.id}
                  className="hover-elevate"
                  data-testid={`payment-${idx}`}
                >
                  <TableCell>
                    {new Date(payment.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="font-heading font-semibold text-primary">
                    ${payment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{payment.method}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className="bg-green-500/10 text-green-600 border-green-500/30"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Paid
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {payment.id.toUpperCase()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-6">
          Revenue Split Breakdown
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-md bg-muted/50">
            <div>
              <div className="font-medium text-foreground">Publisher Share</div>
              <div className="text-sm text-muted-foreground">
                Your earnings from content access
              </div>
            </div>
            <div className="text-right">
              <div className="font-heading text-lg font-bold text-primary">
                90%
              </div>
              <div className="text-sm text-muted-foreground">
                ${(data.totalEarnings * 0.9).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-md bg-muted/50">
            <div>
              <div className="font-medium text-foreground">Platform Fee</div>
              <div className="text-sm text-muted-foreground">
                ContentMeter service fee
              </div>
            </div>
            <div className="text-right">
              <div className="font-heading text-lg font-bold text-foreground">
                10%
              </div>
              <div className="text-sm text-muted-foreground">
                ${(data.totalEarnings * 0.1).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
