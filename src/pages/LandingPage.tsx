import { Hero } from '../components/landing/Hero';
import { ScrollStory } from '../components/landing/ScrollStory';
import { SavingsCalculator } from '../components/landing/SavingsCalculator';
import { ProviderComparison } from '../components/landing/ProviderComparison';
import { ClosingCta } from '../components/landing/ClosingCta';

export function LandingPage() {
  return (
    <main>
      <Hero />
      <ScrollStory />
      <SavingsCalculator />
      <ProviderComparison />
      <ClosingCta />
    </main>
  );
}
