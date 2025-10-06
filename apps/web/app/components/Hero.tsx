'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@repo/ui/button';
import AnimatedCounter from './AnimatedCounter';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-card py-20 md:py-32">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-8">
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-foreground">
              AI Reads. Publishers Earn. Simple.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Real-time micropayments for every piece of content accessed by AI
            </p>

            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-md px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Publishers earned
              </span>
              <AnimatedCounter
                start={247893}
                end={248156}
                prefix="$"
                className="text-2xl font-heading font-bold text-primary"
              />
              <span className="text-sm text-muted-foreground">in October</span>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-chart-2 hover:opacity-90 transition-opacity"
                data-testid="button-launch-dashboard"
              >
                Launch Your Dashboard
              </Button>
              <Button
                size="lg"
                variant="outline"
                data-testid="button-see-transactions"
              >
                See Live Transactions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/assets/images/content_flowing_to_payments_visualization.png"
                alt="Content blocks flowing to payment nodes visualization"
                width={800}
                height={600}
                className="w-full h-auto"
                data-testid="img-hero"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
