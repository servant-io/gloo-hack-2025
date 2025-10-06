'use client';

import { useState } from 'react';
import { Card } from '@repo/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { ArrowRight, Search, FileText, DollarSign } from 'lucide-react';
import { Button } from '@repo/ui/button';

const demoScenarios = {
  bible: {
    query: 'Explain the theological significance of Romans 8:28',
    cost: 0.023,
    breakdown: [
      { label: 'Content Access', amount: 0.015 },
      { label: 'Processing', amount: 0.005 },
      { label: 'Attribution', amount: 0.003 },
    ],
  },
  research: {
    query: 'Comparative analysis of Augustine and Aquinas on grace',
    cost: 0.067,
    breakdown: [
      { label: 'Content Access', amount: 0.045 },
      { label: 'Processing', amount: 0.015 },
      { label: 'Attribution', amount: 0.007 },
    ],
  },
  sermon: {
    query: 'Sermon outline for Luke 15 with practical applications',
    cost: 0.041,
    breakdown: [
      { label: 'Content Access', amount: 0.028 },
      { label: 'Processing', amount: 0.009 },
      { label: 'Attribution', amount: 0.004 },
    ],
  },
};

export default function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState('bible');
  const scenario = demoScenarios[activeTab as keyof typeof demoScenarios];

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Try It Right Now
          </h2>
          <p className="text-muted-foreground">
            See how ContentMeter tracks and meters AI queries in real-time
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className="grid w-full grid-cols-3 mb-6"
              data-testid="tabs-demo"
            >
              <TabsTrigger value="bible" data-testid="tab-bible">
                Bible Study
              </TabsTrigger>
              <TabsTrigger value="research" data-testid="tab-research">
                Academic Research
              </TabsTrigger>
              <TabsTrigger value="sermon" data-testid="tab-sermon">
                Sermon Prep
              </TabsTrigger>
            </TabsList>

            {Object.keys(demoScenarios).map((key) => (
              <TabsContent key={key} value={key} className="space-y-6">
                <div className="bg-muted/50 rounded-md p-4 flex items-start gap-3">
                  <Search className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">
                      {scenario.query}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div className="h-12 w-12 rounded-md bg-chart-2/10 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-chart-2" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium text-foreground">
                    Cost Breakdown
                  </div>
                  {scenario.breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm"
                      data-testid={`breakdown-${idx}`}
                    >
                      <span className="text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="font-mono text-foreground">
                        ${item.amount.toFixed(3)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex items-center justify-between font-medium">
                    <span className="text-foreground">Total</span>
                    <span
                      className="text-lg font-heading text-primary"
                      data-testid="text-total-cost"
                    >
                      ${scenario.cost.toFixed(3)}
                    </span>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-6 text-center">
            <Button variant="ghost" data-testid="button-view-analytics">
              View Full Analytics
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
