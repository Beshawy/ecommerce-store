import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Lock, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const AdminLogin = () => {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'signup') {
      const { error } = await signUp(email, password);
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني ثم تسجيل الدخول.');
        setMode('login');
      }
    } else {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <ShoppingBag className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">
            {mode === 'login' ? 'Admin Login' : 'Create Account'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'login' ? 'Sign in to manage your store' : 'Create a new account to get started'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="rounded-lg"
          />
          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {mode === 'login' ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                {loading ? 'Signing in...' : 'Sign In'}
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                {loading ? 'Creating...' : 'Create Account'}
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
