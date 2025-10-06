'use client';

import { Upload, Network, Gauge, Zap, BarChart3 } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Publishers Upload',
    description: 'Simple drag-drop interface for content',
    color: 'bg-chart-1/10 text-chart-1',
  },
  {
    icon: Network,
    title: 'AI Queries Content',
    description: 'Network connects AI to your resources',
    color: 'bg-chart-2/10 text-chart-2',
  },
  {
    icon: Gauge,
    title: 'Automatic Metering',
    description: 'Real-time usage tracking',
    color: 'bg-chart-3/10 text-chart-3',
  },
  {
    icon: Zap,
    title: 'Instant Payment',
    description: 'Micropayments flow automatically',
    color: 'bg-chart-4/10 text-chart-4',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track performance and revenue',
    color: 'bg-chart-5/10 text-chart-5',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From upload to payment in five simple steps
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-5">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="text-center space-y-4"
                data-testid={`step-${idx + 1}`}
              >
                <div className="relative">
                  <div
                    className={`mx-auto h-20 w-20 rounded-md ${step.color} flex items-center justify-center`}
                  >
                    <Icon className="h-10 w-10" />
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border" />
                  )}
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
