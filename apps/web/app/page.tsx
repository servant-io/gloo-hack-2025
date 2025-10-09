import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProblemSolution from '@/components/ProblemSolution';
import ProofPoints from '@/components/ProofPoints';
import InteractiveDemo from '@/components/InteractiveDemo';
import ScrollAnimation from '@/components/ScrollAnimation';
import HowItWorks from '@/components/HowItWorks';
import MarketOpportunity from '@/components/MarketOpportunity';
import SocialProof from '@/components/SocialProof';
import ClosingCTA from '@/components/ClosingCTA';
import FloatingDemoButton from '@/components/FloatingDemoButton';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <ProblemSolution />
      <ProofPoints />
      <div id="demo-section">
        <InteractiveDemo />
      </div>
      <ScrollAnimation />
      <HowItWorks />
      <MarketOpportunity />
      <SocialProof />
      <ClosingCTA />
      <FloatingDemoButton />
    </div>
  );
}
