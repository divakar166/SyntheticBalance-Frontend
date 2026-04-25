'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { session, isLoading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && session) {
      router.replace('/dashboard');
    }
  }, [isLoading, router, session]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        router.replace('/dashboard');
      } else {
        const signedIn = await signUp(email, password);
        if (signedIn) {
          router.replace('/dashboard');
        } else {
          setMessage('Check your inbox to confirm the account, then sign in.');
          setMode('signin');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || session) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Synthetic Data Generator</h1>
          </div>
          <p className="text-muted-foreground">Secure access for dataset and GPU workflows</p>
        </div>

        <Card>
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <CardTitle>Account Access</CardTitle>
            <CardDescription>Sign in with your Supabase account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'signin' | 'signup')}>
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                    {message}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isSubmitting}
                    minLength={6}
                    required
                  />
                </div>

                <TabsContent value="signin" forceMount hidden={mode !== 'signin'}>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                </TabsContent>
                <TabsContent value="signup" forceMount hidden={mode !== 'signup'}>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                  </Button>
                </TabsContent>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
