import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import toast from 'react-hot-toast';
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Layers, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    sector: 'Manufacturing - Polluting',
    location: 'Pune',
    investmentSize: '15000000',
    stage: 'New Setup',
    projectName: 'Shivaji Industrial Works'
  });
  const [loading, setLoading] = useState(false);

  const sectors = [
    { name: 'Manufacturing - Non-Polluting', desc: 'Standard engineering, assembly, or light fabrication' },
    { name: 'Manufacturing - Polluting', desc: 'Chemical, metallurgy, textile processing, or heavy units' },
    { name: 'IT/Services', desc: 'Software development, data centers, hardware, or tech services' },
    { name: 'Food Processing', desc: 'Agro-processing, cold storage, dairy, or food packaging' }
  ];

  const locations = ['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad', 'Kolhapur', 'Thane', 'Solapur'];
  const stages = ['New Setup', 'Expansion', 'Diversification', 'Modernization'];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/applications', formData);
      toast.success('Project intake complete. Redirecting to approval checklist.');
      navigate(`/upload/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to complete intake');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in font-sans">
      {/* Institutional Banner Header */}
      <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px]">
              MAITRI-Setu Companion Intake
            </Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400 font-medium">State of Maharashtra</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-heading">
            New Industrial Project Specification
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
            Multi-department intake wizard to compute statutory clearance requirements, legal SLAs, and parallel approval routing.
          </p>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center gap-2 shrink-0">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? 'bg-zinc-100 text-zinc-950 font-extrabold border border-white'
                  : step > s
                  ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                  : 'bg-zinc-950 text-zinc-600 border border-zinc-900'
              }`}
            >
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>
      </div>

      {/* Main Multi-Step Form */}
      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader className="border-b border-zinc-900">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              {step === 1 && 'Step 1: Enterprise Profile & Identification'}
              {step === 2 && 'Step 2: Sector Categorization & Location'}
              {step === 3 && 'Step 3: Investment Scale & Project Stage'}
            </CardTitle>
            <span className="text-xs text-zinc-500 font-mono">Step {step} of 3</span>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                  Project Title / Enterprise Name *
                </label>
                <Input
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="e.g. Shivaji Industrial Precision Components Unit"
                  required
                />
                <p className="text-[11px] text-zinc-500">Official enterprise name for statutory filings</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                  Select Project Stage *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {stages.map((stg) => (
                    <button
                      key={stg}
                      type="button"
                      onClick={() => setFormData({ ...formData, stage: stg })}
                      className={`p-4 rounded-xl text-left border transition-all ${
                        formData.stage === stg
                          ? 'bg-zinc-900 border-zinc-100 text-white font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{stg}</div>
                      <div className="text-[10px] text-zinc-500 mt-1">
                        {stg === 'New Setup' && 'Greenfield investment requiring initial clearances'}
                        {stg === 'Expansion' && 'Capacity addition at existing industrial site'}
                        {stg === 'Diversification' && 'New product lines requiring altered NOCs'}
                        {stg === 'Modernization' && 'Technology upgrade & compliance update'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                  Industry Sector Categorization *
                </label>
                <div className="space-y-2.5">
                  {sectors.map((sec) => (
                    <button
                      key={sec.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, sector: sec.name })}
                      className={`w-full p-4 rounded-xl text-left border flex items-center justify-between transition-all ${
                        formData.sector === sec.name
                          ? 'bg-zinc-900 border-zinc-100 text-white'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{sec.name}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">{sec.desc}</div>
                      </div>
                      {formData.sector === sec.name && (
                        <Badge variant="default" className="text-[9px]">Selected</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                  Maharashtra District / Industrial Region *
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="gov-input"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc} className="bg-zinc-900 text-zinc-100">
                      {loc} District
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                  Total Planned Capital Investment (INR) *
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.investmentSize}
                    onChange={(e) => setFormData({ ...formData, investmentSize: e.target.value })}
                    className="pl-8"
                    placeholder="15000000"
                    required
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-bold">₹</span>
                </div>
                <p className="text-[11px] text-zinc-500">Used to match state industrial subsidies (PSI 2019 policy)</p>
              </div>

              {/* Review Box */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Intake Summary Review</span>
                  <Badge variant="outline" className="text-[9px]">Pre-Validated</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Enterprise</span>
                    <span className="font-bold text-zinc-100">{formData.projectName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Sector</span>
                    <span className="font-bold text-zinc-100">{formData.sector}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Location</span>
                    <span className="font-bold text-zinc-100">{formData.location} District</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Investment</span>
                    <span className="font-bold text-zinc-100">₹{Number(formData.investmentSize).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-zinc-900 p-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="gap-2 text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              variant="default"
              onClick={handleNext}
              className="gap-2 text-xs font-bold"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              onClick={handleSubmit}
              disabled={loading}
              className="gap-2 text-xs font-bold bg-zinc-100 text-zinc-950 hover:bg-white"
            >
              {loading ? <div className="spinner !w-4 !h-4"></div> : <><ShieldCheck className="w-4 h-4" /> Generate Clearance Matrix</>}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
