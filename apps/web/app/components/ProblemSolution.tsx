import { Card } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import {
  Lock,
  BarChart3,
  DollarSign,
  Shield,
  Zap,
  CheckCircle,
} from 'lucide-react';

export default function ProblemSolution() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-card to-background">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" data-testid="badge-problem">
            The Challenge
          </Badge>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4">
            Great Content, Invisible in AI
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            AI assistants are now where people seek truth, wisdom, and learning.
            But there&rsquo;s a problem.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <Card className="p-6 md:p-8" data-testid="card-problem-1">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-md bg-destructive/10">
                <Lock className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                  Trusted Content is Locked Away
                </h3>
              </div>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>
                  Publishers&rsquo; valuable content sits trapped in private
                  systems—LMS platforms, walled APIs, and inaccessible databases
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>
                  AI tools serve generic, unlicensed answers instead of
                  authoritative, faith-based resources
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>The bridge between truth and technology is broken</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 md:p-8" data-testid="card-problem-2">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-md bg-destructive/10">
                <BarChart3 className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                  No Visibility, No Value
                </h3>
              </div>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>
                  Publishers can&rsquo;t track how, when, or where their content
                  is being used by AI systems
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>
                  Zero analytics, zero attribution, zero compensation for
                  content access
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>
                  Fear of data loss prevents sharing with AI platforms
                </span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Solution Section */}
        <div className="relative">
          <div className="text-center mb-12">
            <Badge
              className="mb-4 bg-primary/10 text-primary border-primary/20"
              data-testid="badge-solution"
            >
              The Solution
            </Badge>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4">
              Secure, Metered, and Fair Access
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Faith Connection provides an OAuth-gated content metering system
              that lets AI agents access, measure, and pay for trusted publisher
              content.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover-elevate" data-testid="card-solution-1">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-lg bg-primary/10 mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                  OAuth-Gated Access
                </h3>
                <p className="text-sm text-muted-foreground">
                  Verify and control who accesses your content before delivery.
                  Your content, your rules.
                </p>
              </div>
            </Card>

            <Card className="p-6 hover-elevate" data-testid="card-solution-2">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-lg bg-primary/10 mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                  Real-Time Metering
                </h3>
                <p className="text-sm text-muted-foreground">
                  Track every query with detailed analytics on source, platform,
                  and usage patterns.
                </p>
              </div>
            </Card>

            <Card className="p-6 hover-elevate" data-testid="card-solution-3">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-lg bg-chart-2/10 mb-4">
                  <DollarSign className="h-8 w-8 text-chart-2" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                  Instant Micropayments
                </h3>
                <p className="text-sm text-muted-foreground">
                  Earn $0.001 to $0.10 per request. Real compensation for real
                  value.
                </p>
              </div>
            </Card>
          </div>

          {/* Key Benefits */}
          <div className="mt-12 p-6 md:p-8 rounded-lg bg-primary/5 border border-primary/20">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    Full Analytics Dashboard
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor content performance and engagement in real-time
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    Complete Control
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Manage permissions and payouts through your admin console
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    Secure Infrastructure
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Enterprise-grade security with OAuth and API key management
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    Fair Compensation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Every query metered. Every creator rewarded.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
