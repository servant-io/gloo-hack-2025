'use client';

import { Card } from '@repo/ui/card';
import { TrendingUp, BookOpen, Sparkles } from 'lucide-react';
import { SiOpenai } from 'react-icons/si';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const miniChartData = [
  { value: 0.045 },
  { value: 0.052 },
  { value: 0.048 },
  { value: 0.061 },
  { value: 0.058 },
  { value: 0.071 },
  { value: 0.065 },
];

export default function ProofPoints() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 hover-elevate" data-testid="card-proof-pricing">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-heading font-bold text-2xl text-foreground">
                    $0.001 to $0.10
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per request
                  </div>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={50}>
              <LineChart data={miniChartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card
            className="p-6 hover-elevate"
            data-testid="card-proof-resources"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-md bg-chart-2/10">
                <BookOpen className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <div className="font-heading font-bold text-2xl text-foreground">
                  500+
                </div>
                <div className="text-sm text-muted-foreground">
                  Seminary Resources
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground"
                  data-testid={`badge-seminary-${i}`}
                >
                  S{i}
                </div>
              ))}
            </div>
          </Card>

          <Card
            className="p-6 hover-elevate"
            data-testid="card-proof-platforms"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-md bg-chart-3/10">
                <Sparkles className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <div className="font-heading font-bold text-2xl text-foreground">
                  3 Major
                </div>
                <div className="text-sm text-muted-foreground">
                  AI Platforms
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <div className="p-2 rounded bg-muted" data-testid="icon-openai">
                <SiOpenai className="h-5 w-5 text-foreground" />
              </div>
              <div
                className="p-2 rounded bg-muted flex items-center justify-center text-xs font-bold text-foreground"
                data-testid="icon-claude"
              >
                C
              </div>
              <div
                className="p-2 rounded bg-muted flex items-center justify-center text-xs font-bold text-foreground"
                data-testid="icon-gloo"
              >
                G
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
