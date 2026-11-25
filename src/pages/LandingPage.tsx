import { Hero } from '../components/landing/Hero';
import { BenchmarkStrip } from '../components/landing/BenchmarkStrip';
import { SavingsCalculator } from '../components/landing/SavingsCalculator';
import { WorkflowWiring } from '../components/landing/WorkflowWiring';
import { FeatureBento } from '../components/landing/FeatureBento';
import { TradeoffsSection } from '../components/landing/TradeoffsSection';

export function LandingPage() {
  return (
    <main>
      <Hero />
      <BenchmarkStrip />
      <SavingsCalculator />
      <WorkflowWiring />
      <FeatureBento />
      <TradeoffsSection />
    </main>
  );
}
