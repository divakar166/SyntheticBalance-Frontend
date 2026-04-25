'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Database, Brain } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function Home() {
  const router = useRouter();
  const { session, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;
    if (session) {
      router.push('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [isAuthLoading, router, session]);

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Synthetic Data Generator</h1>
            </div>
            <Button
              onClick={() => router.push('/login')}
              variant="default"
            >
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="space-y-8 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Generate Balanced Training Data Effortlessly
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Upload your imbalanced dataset and let our AI generate high-quality synthetic data to balance your classes. Perfect for machine learning projects that struggle with class imbalance.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={() => router.push('/login')}
                className="gap-2"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <h3 className="mb-12 text-center text-3xl font-bold">How It Works</h3>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="space-y-4 rounded-lg border border-border/40 bg-muted/50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Database className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-semibold">Step 1: Upload Data</h4>
              <p className="text-sm text-muted-foreground">
                Upload your CSV file with imbalanced data. We automatically detect your schema and class distribution.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 rounded-lg border border-border/40 bg-muted/50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Brain className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-semibold">Step 2: Train Model</h4>
              <p className="text-sm text-muted-foreground">
                Configure training parameters and let our CTGAN model learn the patterns of your data.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 rounded-lg border border-border/40 bg-muted/50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-semibold">Step 3: Generate Data</h4>
              <p className="text-sm text-muted-foreground">
                Generate synthetic samples to balance your dataset and improve model performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <h3 className="mb-12 text-center text-3xl font-bold">Why Use Our Platform?</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 rounded-lg border border-border/40 p-6">
              <h4 className="font-semibold">Smart Data Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Automatic feature detection and statistical analysis of your dataset. Know exactly what you&apos;re working with.
              </p>
            </div>
            <div className="space-y-3 rounded-lg border border-border/40 p-6">
              <h4 className="font-semibold">Advanced ML Models</h4>
              <p className="text-sm text-muted-foreground">
                Uses state-of-the-art CTGAN and Tabular Diffusion models for realistic synthetic data generation.
              </p>
            </div>
            <div className="space-y-3 rounded-lg border border-border/40 p-6">
              <h4 className="font-semibold">Configurable Training</h4>
              <p className="text-sm text-muted-foreground">
                Fine-tune epochs, batch size, and model selection to match your specific requirements.
              </p>
            </div>
            <div className="space-y-3 rounded-lg border border-border/40 p-6">
              <h4 className="font-semibold">Real-time Monitoring</h4>
              <p className="text-sm text-muted-foreground">
                Watch training progress with live loss charts and logs. Understand model behavior as it trains.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/40 bg-muted/50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="space-y-6 text-center">
            <h3 className="text-3xl font-bold">Ready to Balance Your Data?</h3>
            <p className="text-lg text-muted-foreground">
              Start generating synthetic data today and improve your model&apos;s performance on minority classes.
            </p>
            <Button
              size="lg"
              onClick={() => router.push('/login')}
              className="gap-2"
            >
              Get Started Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h4 className="font-semibold">Product</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Features</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms</a></li>
                <li><a href="#" className="hover:text-foreground">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Synthetic Data Generator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
