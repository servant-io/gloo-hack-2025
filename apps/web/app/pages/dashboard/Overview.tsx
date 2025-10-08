'use client';

import { Card } from '@repo/ui/card';
import { useAuth } from '@/lib/auth';
import { mockPublisherData } from '@/lib/mockData';
import { TrendingUp, FileText, DollarSign, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { usePublisherOverview } from '@/hooks/usePublisherOverview';
import { resolvePublisherId } from '@/lib/api/publisher-map';

export default function Overview() {
  const { user } = useAuth();

  const data = user
    ? mockPublisherData[user.id as keyof typeof mockPublisherData]
    : null;

  const publisherId = resolvePublisherId(user?.id);
  const {
    data: overview,
    loading: overviewLoading,
    error: overviewError,
  } = usePublisherOverview(publisherId);

  if (!data) {
    return null;
  }

  const fallbackOverview = publisherId
    ? {
        publisherId,
        totalEarnings: data.totalEarnings,
        monthlyEarnings: data.monthlyEarnings,
        totalRequests: data.totalRequests,
        monthlyRequests: data.monthlyRequests,
        contentCount: data.content.length,
        calculationWindowDays: 30,
      }
    : null;

  const overviewMetrics = overview ?? fallbackOverview;
  const usingMockMetrics = !overview && !!fallbackOverview;

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          Overview
        </h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        {overviewLoading && (
          <p className="text-xs text-muted-foreground mt-2">
            Fetching live metrics&hellip;
          </p>
        )}
        {overviewError && (
          <p className="text-xs text-destructive mt-2">
            Live metrics are unavailable right now. Showing sample numbers.
          </p>
        )}
        {usingMockMetrics && !overviewError && (
          <p className="text-xs text-muted-foreground mt-2">
            Showing sample metrics until live data is available.
          </p>
        )}
        {overview && (
          <p className="text-xs text-muted-foreground mt-2">
            Live metrics window: last {overview.calculationWindowDays} days.
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6" data-testid="card-total-earnings">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-md bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">All time</span>
          </div>
          <div className="font-heading text-2xl font-bold text-foreground">
            $
            {(overviewMetrics?.totalEarnings ?? data.totalEarnings).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Earnings</div>
        </Card>

        <Card className="p-6" data-testid="card-monthly-earnings">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-md bg-chart-2/10">
              <TrendingUp className="h-5 w-5 text-chart-2" />
            </div>
            <span className="text-xs text-muted-foreground">This month</span>
          </div>
          <div className="font-heading text-2xl font-bold text-foreground">
            $
            {(overviewMetrics?.monthlyEarnings ?? data.monthlyEarnings).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Monthly Earnings</div>
        </Card>

        <Card className="p-6" data-testid="card-total-requests">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-md bg-chart-3/10">
              <Activity className="h-5 w-5 text-chart-3" />
            </div>
            <span className="text-xs text-muted-foreground">All time</span>
          </div>
          <div className="font-heading text-2xl font-bold text-foreground">
            {(overviewMetrics?.totalRequests ?? data.totalRequests).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Requests</div>
        </Card>

        <Card className="p-6" data-testid="card-content-items">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-md bg-chart-4/10">
              <FileText className="h-5 w-5 text-chart-4" />
            </div>
            <span className="text-xs text-muted-foreground">Published</span>
          </div>
          <div className="font-heading text-2xl font-bold text-foreground">
            {(overviewMetrics?.contentCount ?? data.content.length).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Content Items</div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-6">
            Earnings Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.earningsHistory}>
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
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => [
                  `$${value.toFixed(2)}`,
                  'Earnings',
                ]}
              />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-6">
            Usage by Platform
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.usageByApp}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ app, percent }) =>
                  `${app} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="requests"
              >
                {data.usageByApp.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-6">
          Top Performing Content
        </h3>
        <div className="space-y-4">
          {data.content.slice(0, 3).map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-md bg-muted/50 hover-elevate"
              data-testid={`content-${idx}`}
            >
              <div className="flex-1">
                <div className="font-medium text-foreground">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.type}</div>
              </div>
              <div className="text-right">
                <div className="font-heading font-semibold text-primary">
                  ${item.earnings.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.requests.toLocaleString()} requests
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
