import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function ChecklistForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sector: '',
    location: '',
    investmentSize: '',
    stage: 'New Setup'
  });
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const sectors = [
    'Manufacturing - Non-Polluting',
    'Manufacturing - Polluting',
    'IT/Services',
    'Food Processing'
  ];

  const locations = ['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad', 'Kolhapur', 'Thane', 'Solapur'];
  const stages = ['New Setup', 'Expansion', 'Diversification', 'Modernization'];

  const handleGenerateChecklist = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/checklist', formData);
      setChecklist(res.data);
      toast.success('Dynamic checklist generated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate checklist');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async () => {
    setCreating(true);
    try {
      const res = await api.post('/applications', formData);
      toast.success('Application initialized');
      navigate(`/upload/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create application');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Smart Checklist Generator</h1>
        <p className="text-slate-400 text-sm mt-1">
          Input your enterprise details to compute parallel approvals and legal SLAs dynamically
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form Card */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              1
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Enterprise Specification</h2>
          </div>

          <form onSubmit={handleGenerateChecklist} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Industry Sector *</label>
              <select
                value={formData.sector}
                onChange={e => setFormData({ ...formData, sector: e.target.value })}
                className="input-field"
                required
                id="checklist-sector"
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">Select sector...</option>
                {sectors.map(s => <option key={s} value={s} className="bg-slate-900 text-slate-100">{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">District / Region *</label>
              <select
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="input-field"
                required
                id="checklist-location"
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">Select location...</option>
                {locations.map(l => <option key={l} value={l} className="bg-slate-900 text-slate-100">{l}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Total Capital Investment (₹) *</label>
              <input
                type="number"
                value={formData.investmentSize}
                onChange={e => setFormData({ ...formData, investmentSize: e.target.value })}
                className="input-field"
                placeholder="e.g. 15000000"
                required
                min="100000"
                id="checklist-investment"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Project Stage</label>
              <select
                value={formData.stage}
                onChange={e => setFormData({ ...formData, stage: e.target.value })}
                className="input-field"
                id="checklist-stage"
              >
                {stages.map(s => <option key={s} value={s} className="bg-slate-900 text-slate-100">{s}</option>)}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 justify-center text-sm font-bold shadow-lg shadow-indigo-500/25 mt-2"
              id="generate-checklist-btn"
            >
              {loading ? <div className="spinner !w-5 !h-5"></div> : 'Generate AI Checklist'}
            </button>
          </form>
        </div>

        {/* Results Preview Card */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-6">
            <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              2
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Required Clearances Matrix</h2>
          </div>

          {!checklist ? (
            <div className="text-center py-16 text-slate-500 space-y-3">
              <p className="text-sm font-medium">Select your enterprise details and click "Generate AI Checklist".</p>
            </div>
          ) : (
            <div className="space-y-6 animate-scale-in">
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                <span className="font-bold">Parallel Workflow Active:</span> Independent departmental clearances can run concurrently to reduce approval wait times.
              </div>

              <div className="space-y-3">
                {checklist.approvals?.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.approvalType}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.departmentName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        item.isParallel ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.isParallel ? 'Parallel' : 'Sequential'}
                      </span>
                      <p className="text-[11px] font-semibold text-amber-400 mt-1">SLA: {item.defaultSlaDays} Days</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleCreateApplication}
                disabled={creating}
                className="btn-success w-full py-3 justify-center text-sm font-bold shadow-lg shadow-emerald-500/25"
                id="create-application-btn"
              >
                {creating ? <div className="spinner !w-5 !h-5"></div> : 'Initialize Application & Upload Documents'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
