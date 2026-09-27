import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import toast from 'react-hot-toast';
import { 
  Building2, 
  UserCheck, 
  ArrowLeft, 
  Zap, 
  FileCheck2, 
  Clock, 
  Award,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('applicant');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      toast.success(`Welcome, ${res.data.user.name}`);
      navigate(res.data.user.role === 'officer' ? '/officer' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      login(res.data.token, res.data.user);
      toast.success(`Account created successfully! Welcome, ${res.data.user.name}`);
      navigate(res.data.user.role === 'officer' ? '/officer' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans flex flex-col justify-between">
      {/* Top Header Link */}
      <header className="max-w-7xl w-full mx-auto px-6 h-16 flex items-center justify-between border-b border-zinc-900">
        <Link to="/" className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-100 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Return to Public Overview
        </Link>
        <Badge variant="outline" className="text-[10px]">
          State of Maharashtra • MAITRI Single-Window Portal
        </Badge>
      </header>

      {/* Main Split Screen Container */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* LEFT PANEL: Institutional System Information */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-950 flex items-center justify-center font-extrabold text-xl font-heading shadow-sm">
                M
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 font-heading tracking-tight leading-tight">
                MAITRI-Setu Single-Window <br />
                <span className="text-zinc-400">Intelligence & Compliance Layer</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-lg leading-relaxed">
                An official companion system sitting alongside Maharashtra’s MAITRI portal to accelerate industrial clearances through parallel workflow routing, OCR pre-validation, and legal SLA countdown monitoring.
              </p>
            </div>

            {/* Core Capability Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Zap className="w-4 h-4 text-zinc-400" /> Parallel Approvals
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Triggers independent NOCs (MPCB, Fire, Labour) concurrently.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <FileCheck2 className="w-4 h-4 text-zinc-400" /> OCR Pre-Validation
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Catches document header & signature errors before filing.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Clock className="w-4 h-4 text-zinc-400" /> Statutory SLA Tracking
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Background cron jobs track legal deadlines & auto-escalate.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Award className="w-4 h-4 text-zinc-400" /> Incentive Matching
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Auto-matches state capital subsidies & stamp duty waivers.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-zinc-500">
              <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>Statutory safeguards, environmental checks, and safety NOC requirements remain 100% intact.</span>
            </div>
          </div>

          {/* RIGHT PANEL: Sign-In / Register Card */}
          <div className="lg:col-span-5">
            <Card className="border-zinc-800 bg-zinc-950 p-8 shadow-2xl space-y-6">
              
              {/* Mode Selector Tabs */}
              <Tabs value={mode} onValueChange={setMode} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="login" className="text-xs font-bold">Sign In</TabsTrigger>
                  <TabsTrigger value="register" className="text-xs font-bold">Create Account</TabsTrigger>
                </TabsList>
              </Tabs>

              <div>
                <h2 className="text-xl font-bold text-zinc-100 font-heading tracking-tight">
                  {mode === 'login' ? 'Portal Sign In' : 'Register New Account'}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {mode === 'login' 
                    ? 'Enter your credentials to access your portal' 
                    : 'Create a fresh account to start your application from scratch'}
                </p>
              </div>

              {/* Form */}
              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Email Address</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      id="login-email"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      id="login-password"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading} 
                    variant="default" 
                    size="lg" 
                    className="w-full font-bold mt-2" 
                    id="login-submit"
                  >
                    {loading ? <div className="spinner !w-4 !h-4"></div> : 'Sign In to Portal'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Full Name</label>
                    <Input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      required
                      id="register-name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Email Address</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      required
                      id="register-email"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      id="register-password"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Account Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={role === 'applicant' ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs font-semibold"
                        onClick={() => setRole('applicant')}
                      >
                        <Building2 className="w-3.5 h-3.5 mr-1.5" /> Entrepreneur
                      </Button>
                      <Button
                        type="button"
                        variant={role === 'officer' ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs font-semibold"
                        onClick={() => setRole('officer')}
                      >
                        <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Officer
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading} 
                    variant="default" 
                    size="lg" 
                    className="w-full font-bold mt-2" 
                    id="register-submit"
                  >
                    {loading ? <div className="spinner !w-4 !h-4"></div> : 'Create & Sign In'}
                  </Button>
                </form>
              )}

            </Card>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        <p>Built for SIH 2026 • MAITRI-Setu Companion Intelligence Layer</p>
      </footer>
    </div>
  );
}

