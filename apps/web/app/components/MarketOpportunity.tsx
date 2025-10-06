'use client';

import { Card } from '@repo/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { TrendingUp, Users, Target } from 'lucide-react';

const growthData = [
  { year: '2024', revenue: 1.2 },
  { year: '2025', revenue: 3.8 },
  { year: '2026', revenue: 8.5 },
];

export default function MarketOpportunity() {
  return (
    <section className="py-20 bg-gradient-to-b from-card to-background">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Market Opportunity
          </h2>
          <p className="text-muted-foreground">
            Unprecedented growth in Christian tech and AI-powered education
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mb-12">
          <Card
            className="p-6 text-center hover-elevate"
            data-testid="card-market-size"
          >
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="font-heading text-4xl font-bold text-foreground mb-2">
              $7B
            </div>
            <div className="text-muted-foreground">
              Christian Publishing Market
            </div>
          </Card>

          <Card
            className="p-6 text-center hover-elevate"
            data-testid="card-students"
          >
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-chart-2/10 mb-4">
              <Users className="h-6 w-6 text-chart-2" />
            </div>
            <div className="font-heading text-4xl font-bold text-foreground mb-2">
              250,000+
            </div>
            <div className="text-muted-foreground">
              Theology Students Globally
            </div>
          </Card>

          <Card
            className="p-6 text-center hover-elevate"
            data-testid="card-opportunity"
          >
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-chart-3/10 mb-4">
              <Target className="h-6 w-6 text-chart-3" />
            </div>
            <div className="font-heading text-lg font-bold text-foreground mb-2">
              Every Query
            </div>
            <div className="text-muted-foreground">
              is a Revenue Opportunity
            </div>
          </Card>
        </div>

        <Card className="p-8">
          <h3 className="font-heading text-xl font-semibold text-foreground mb-6">
            Projected Growth (Millions)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={growthData}>
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </section>
  );
}
