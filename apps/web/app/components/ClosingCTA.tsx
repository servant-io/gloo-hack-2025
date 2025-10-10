'use client';

import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Rocket } from 'lucide-react';

export default function ClosingCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary via-chart-3 to-chart-2 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

      <div className="container mx-auto max-w-4xl px-4 md:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-8">
          <Badge
            className="bg-white/20 text-white border-white/30"
            data-testid="badge-launch"
          >
            <Rocket className="h-3 w-3 mr-1" />
            Launching at Gloo Hackathon 2025
          </Badge>

          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white">
            Ready to Monetize Your Content?
          </h2>

          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Join the revolution in AI-powered content monetization. Start
            earning from every AI query today.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
              data-testid="button-publisher-access"
            >
              Creator Access
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
              data-testid="button-university-access"
            >
              University Access
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
