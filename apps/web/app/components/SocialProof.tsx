'use client';

import { Card } from '@repo/ui/card';
import { Award } from 'lucide-react';
import LiveFeed from './LiveFeed';

const partners = [
  'Westminster Seminary',
  'Crossway Publishers',
  'Baker Academic',
  'Zondervan',
  'IVP Academic',
  'Eerdmans',
  'Moody Publishers',
  'B&H Academic',
];

export default function SocialProof() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              Early Access Partners
            </h2>
            <p className="text-muted-foreground mb-8">
              Leading seminaries and creators are already earning with Kingdom
              Connect
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {partners.map((partner, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-md border border-border bg-card text-center hover-elevate"
                  data-testid={`partner-${idx}`}
                >
                  <div className="text-sm font-medium text-foreground">
                    {partner}
                  </div>
                </div>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 p-3 rounded-md border border-primary/30 bg-primary/5">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                MCP Protocol Compatible
              </span>
            </div>
          </div>

          <div>
            <Card className="p-6">
              <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                Live Earnings Feed
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Real-time transactions from our network
              </p>
              <LiveFeed />
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
