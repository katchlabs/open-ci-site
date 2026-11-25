import { Hero } from '../components/landing/Hero';
import { SavingsCalculator } from '../components/landing/SavingsCalculator';
import { BenchmarkStrip } from '../components/landing/BenchmarkStrip';
import { WorkflowWiring } from '../components/landing/WorkflowWiring';
import { FeatureBento } from '../components/landing/FeatureBento';
import { TradeoffsSection } from '../components/landing/TradeoffsSection';

export function LandingPage() {
  return (
    <main>
      <Hero />
      <SavingsCalculator />
      <BenchmarkStrip />
      <WorkflowWiring />
      <FeatureBento />
      <TradeoffsSection />
    </main>
  );
}
