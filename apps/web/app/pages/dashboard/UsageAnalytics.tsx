'use client';

import { Card } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { useAuth } from '@/lib/auth';
import { mockPublisherData } from '@/lib/mockData';
import { Activity, Zap, Clock } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/table';

export default function UsageAnalytics() {
  const { user } = useAuth();
  const data = user
    ? mockPublisherData[user.id as keyof typeof mockPublisherData]
    : null;

  if (!data) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          Usage Analytics
        </h1>
        <p className="text-muted-foreground">
          Track how AI platforms are accessing your content
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {data.usageByApp.map((app, idx) => (
          <Card key={idx} className="p-6" data-testid={`card-app-${idx}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="font-heading font-semibold text-foreground">
                {app.app}
              </div>
              <Badge variant="secondary">
                {((app.requests / data.totalRequests) * 100).toFixed(0)}%
              </Badge>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-muted-foreground">Requests</div>
                <div className="font-mono text-lg font-bold text-foreground">
                  {app.requests.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Revenue</div>
                <div className="font-heading text-lg font-bold text-primary">
                  ${app.earnings.toLocaleString()}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-6">
          Request Volume Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.earningsHistory}>
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Bar
              dataKey="requests"
              fill="hsl(var(--chart-3))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Recent Transactions
          </h3>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-chart-2 animate-pulse" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Content</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentTransactions.map((txn, idx) => (
                <TableRow
                  key={txn.id}
                  className="hover-elevate"
                  data-testid={`txn-${idx}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {txn.timestamp}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{txn.app}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {txn.content}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    ${txn.amount.toFixed(3)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        txn.status === 'completed' ? 'default' : 'secondary'
                      }
                    >
                      {txn.status === 'completed' ? (
                        <>
                          <Zap className="h-3 w-3 mr-1" />
                          Completed
                        </>
                      ) : (
                        'Pending'
                      )}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
