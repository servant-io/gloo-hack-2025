'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { Play } from 'lucide-react';

export default function FloatingDemoButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToDemo = () => {
    document
      .getElementById('demo-section')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-4">
      <Button
        size="lg"
        className="bg-gradient-to-r from-primary to-chart-2 shadow-lg hover:shadow-xl transition-shadow"
        onClick={scrollToDemo}
        data-testid="button-floating-demo"
      >
        <Play className="mr-2 h-4 w-4" />
        Live Demo
      </Button>
    </div>
  );
}
