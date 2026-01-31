import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Vote, Mail, Lock, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError('ইমেইল অথবা পাসওয়ার্ড ভুল হয়েছে');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে');
          } else {
            setError('অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে');
          }
        } else {
          setSuccess('অ্যাকাউন্ট তৈরি হয়েছে! অনুমোদনের অপেক্ষায় আছে।');
          setEmail('');
          setPassword('');
        }
      }
    } catch (err) {
      setError('কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-4 shadow-md">
        <div className="container mx-auto flex items-center gap-3">
          <Vote className="w-8 h-8" />
          <h1 className="text-xl font-bold">অ্যাডমিন প্যানেল</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">
              {isLogin ? 'অ্যাডমিন লগইন' : 'নতুন অ্যাকাউন্ট'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'আপনার অ্যাকাউন্টে লগইন করুন' 
                : 'নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি করুন'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  ইমেইল
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  পাসওয়ার্ড
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-lg">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{success}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading 
                  ? 'অপেক্ষা করুন...' 
                  : isLogin ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  {isLogin 
                    ? 'নতুন অ্যাকাউন্ট তৈরি করুন' 
                    : 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন'}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t">
              <Link 
                to="/" 
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                হোমপেজে ফিরে যান
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
