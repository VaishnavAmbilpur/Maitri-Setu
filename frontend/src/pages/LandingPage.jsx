import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  ShieldCheck, 
  Clock, 
  Award, 
  ArrowRight, 
  Building2, 
  UserCheck, 
  FileCheck2, 
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('parallel');

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-zinc-100 selection:text-zinc-950 font-sans relative">
      {/* Top Header Navigation */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-950 flex items-center justify-center font-extrabold text-xl font-heading shadow-sm">
            M
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100 font-heading tracking-tight">
              MAITRI-Setu
            </h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              State of Maharashtra • Single-Window AI Layer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => goToLogin()}
            variant="outline"
            size="sm"
          >
            <Building2 className="w-3.5 h-3.5 mr-1.5" /> Entrepreneur Portal
          </Button>
          <Button
            onClick={() => goToLogin()}
            variant="default"
            size="sm"
          >
            <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Officer Command Center
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-100 font-heading leading-[1.1]">
          Industrial Approvals, <br />
          <span className="text-zinc-400">Accelerated by Intelligence.</span>
        </h1>

        <p className="text-zinc-400 text-base sm:text-lg max-w-3xl mx-auto font-normal leading-relaxed">
          MAITRI-Setu sits on top of Maharashtra’s single-window portal, converting static filings into a 
          <span className="text-zinc-100 font-bold"> parallel processing engine </span> 
          with real-time SLA tracking and instant OCR pre-validation.
        </p>

        {/* Call-to-Action Launch Cards */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Card 
            onClick={() => goToLogin()}
            className="p-6 text-left group border-zinc-800 bg-zinc-950 hover:border-zinc-700 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="text-[9px]">
                <Building2 className="w-3 h-3 mr-1" /> Applicant Portal
              </Badge>
              <span className="text-xs font-bold text-zinc-100 group-hover:translate-x-1 transition-transform flex items-center">
                Sign In <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
              </span>
            </div>
            <h3 className="text-base font-bold text-zinc-100 font-heading tracking-tight">Entrepreneur Portal</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Generate AI checklist, pre-validate documents via OCR, and track live SLA countdowns.
            </p>
          </Card>

          <Card 
            onClick={() => goToLogin()}
            className="p-6 text-left group border-zinc-800 bg-zinc-950 hover:border-zinc-700 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="text-[9px]">
                <UserCheck className="w-3 h-3 mr-1" /> Officer Portal
              </Badge>
              <span className="text-xs font-bold text-zinc-100 group-hover:translate-x-1 transition-transform flex items-center">
                Sign In <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
              </span>
            </div>
            <h3 className="text-base font-bold text-zinc-100 font-heading tracking-tight">Government Command Center</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Review departmental queues, monitor SLA risk analytics, and coordinate joint site visits.
            </p>
          </Card>
        </div>
      </section>

      {/* Stat Impact Metrics Banner */}
      <section className="max-w-6xl mx-auto px-6 py-10 border-y border-zinc-900 bg-zinc-950/60">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-zinc-100 font-heading">
              75%
            </div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-1">Lead Time Reduced</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-zinc-100 font-heading">
              4+
            </div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-1">Parallel Workflows</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-zinc-100 font-heading">
              100%
            </div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-1">OCR Pre-Validation</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-zinc-100 font-heading">
              Free
            </div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-1">Open Source Stack</div>
          </div>
        </div>
      </section>

      {/* Interactive SIH Feature Showcase Tabs */}
      <section className="max-w-6xl mx-auto px-6 py-20 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-zinc-100 font-heading tracking-tight">Architecture & Intelligence Modules</h2>
          <p className="text-zinc-400 text-xs max-w-xl mx-auto">
            Explore live simulator capabilities
          </p>
        </div>

        {/* Tab Selector */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="parallel">
                <Zap className="w-3.5 h-3.5 mr-1.5" /> Parallel Engine
              </TabsTrigger>
              <TabsTrigger value="ocr">
                <FileCheck2 className="w-3.5 h-3.5 mr-1.5" /> OCR Validation
              </TabsTrigger>
              <TabsTrigger value="sla">
                <Clock className="w-3.5 h-3.5 mr-1.5" /> SLA Countdown
              </TabsTrigger>
              <TabsTrigger value="incentive">
                <Award className="w-3.5 h-3.5 mr-1.5" /> Subsidy Matcher
              </TabsTrigger>
            </TabsList>
          </div>

          <Card className="p-8 border-zinc-800 bg-zinc-950 max-w-4xl mx-auto">
            <TabsContent value="parallel">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100 font-heading">Parallel Clearance Workflow Orchestrator</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Eliminates sequential delays by triggering independent approvals concurrently.</p>
                  </div>
                  <Badge variant="approved">Active Simulation</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-100 mb-1">
                      <span>MPCB Clearance</span>
                      <Badge variant="outline" className="text-[8px]">Parallel</Badge>
                    </div>
                    <p className="text-xs text-zinc-400">Runs simultaneously with Fire NOC</p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-100 mb-1">
                      <span>Fire NOC</span>
                      <Badge variant="outline" className="text-[8px]">Parallel</Badge>
                    </div>
                    <p className="text-xs text-zinc-400">Independent legal SLA timer</p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-100 mb-1">
                      <span>Labour Licence</span>
                      <Badge variant="outline" className="text-[8px]">Parallel</Badge>
                    </div>
                    <p className="text-xs text-zinc-400">Concurrent document verification</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ocr">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100 font-heading">Client-Side OCR Pre-Validation</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Powered by Tesseract.js to detect formatting errors before government submission.</p>
                  </div>
                  <Badge variant="outline">Tesseract.js Engine</Badge>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-zinc-300" />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-100 font-mono">Land_712_Extract_Pune.pdf</h4>
                      <p className="text-[11px] text-zinc-400">Text OCR verified: Header match 99.4%</p>
                    </div>
                  </div>
                  <Badge variant="approved">Validation Passed</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sla">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100 font-heading">Automated SLA Monitoring & Escalation</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Real-time background cron job tracks departmental turnaround deadlines.</p>
                  </div>
                  <Badge variant="warning">Cron SLA Scheduler</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-900 border border-dashed border-zinc-500">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-200 mb-1">
                      <span>Fire NOC</span>
                      <Badge variant="warning" className="text-[8px]">Near Deadline</Badge>
                    </div>
                    <p className="text-xs text-zinc-400">SLA: 1 Day Remaining (Warning Alert)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900 border-2 border-zinc-100">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-100 mb-1">
                      <span>Factory Licence</span>
                      <Badge variant="destructive" className="text-[8px]">SLA Breached</Badge>
                    </div>
                    <p className="text-xs text-zinc-300">SLA: Overdue by 3 Days (Auto-Escalated)</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="incentive">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100 font-heading">State Industrial Incentive Policy Matcher</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Evaluates enterprise sector & capital investment against Maharashtra schemes.</p>
                  </div>
                  <Badge variant="approved">PSI 2019 Engine</Badge>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100 font-heading">Package Scheme of Incentives (PSI 2019)</h4>
                    <p className="text-[11px] text-zinc-400">Capital Subsidy & Stamp Duty Exemption for Pune Zone</p>
                  </div>
                  <Badge variant="approved">Auto-Matched</Badge>
                </div>
              </div>
            </TabsContent>
          </Card>
        </Tabs>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-500">
        <p>Built for SIH 2026 - MAITRI-Setu Single-Window Intelligence Layer</p>
      </footer>
    </div>
  );
}
