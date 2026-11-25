import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { LandingPage } from './pages/LandingPage';

const DocsPage = lazy(() =>
  import('./pages/DocsPage').then((m) => ({ default: m.DocsPage }))
);

function DocsFallback() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[1160px] items-center justify-center px-5">
      <div className="font-mono text-xs text-[#6B7280]">Loading documentation...</div>
    </div>
  );
}

function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0 });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="relative flex min-h-screen flex-col bg-white text-[#0A0A0A]">
      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      <div className="flex-1">
        <Suspense fallback={<DocsFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/docs"
              element={<DocsPage onOpenSearch={() => setSearchOpen(true)} />}
            />
            <Route
              path="/docs/:slug"
              element={<DocsPage onOpenSearch={() => setSearchOpen(true)} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
