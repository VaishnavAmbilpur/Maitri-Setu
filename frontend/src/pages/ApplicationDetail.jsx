import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import toast from 'react-hot-toast';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle,
  Calendar,
  Award,
  Layers
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function ApplicationDetail() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [incentives, setIncentives] = useState(null);
  const [inspections, setInspections] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [appRes, incRes, inspRes] = await Promise.all([
        api.get(`/applications/${id}`),
        api.get(`/incentives/match/${id}`).catch(() => null),
        api.get(`/inspections/${id}`).catch(() => null)
      ]);
      setApp(appRes.data);
      if (incRes) setIncentives(incRes.data);
      if (inspRes) setInspections(inspRes.data);
    } catch {
      toast.error('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 py-12">
        <div className="h-8 w-64 skeleton-pulse rounded-lg"></div>
        <div className="h-32 w-full skeleton-pulse rounded-xl"></div>
      </div>
    );
  }

  if (!app) return <div className="text-center py-20 text-zinc-400 text-xs">Application record not found.</div>;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto font-sans">
      {/* Header Banner */}
      <Card className="border-zinc-800 bg-zinc-950 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-zinc-100 font-heading">{app.sector}</h1>
            <Badge variant={
              app.status === 'approved' ? 'approved' :
              app.status === 'submitted' ? 'in_progress' : 'secondary'
            }>
              {app.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 font-medium">
            District: <span className="text-zinc-200 font-semibold">{app.location}</span> • Capital: <span className="text-zinc-200 font-semibold">₹{Number(app.investmentSize).toLocaleString()}</span> • Stage: <span className="text-zinc-200 font-semibold">{app.stage}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="w-4 h-4" /> Overview
            </Button>
          </Link>
          {app.status === 'draft' && (
            <Link to={`/upload/${app.id}`}>
              <Button variant="default" size="sm" className="text-xs font-bold">
                Upload Documents
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Approval Timeline Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-400" /> Parallel Department Clearances & Statutory SLAs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {app.approvals?.map((approval) => {
            const isBreached = approval.alertStatus === 'breached' || approval.slaInfo?.slaStatus === 'breached';
            const isWarning = approval.alertStatus === 'warning' || approval.slaInfo?.slaStatus === 'warning';
            const isApproved = approval.status === 'approved';

            return (
              <Card 
                key={approval.id} 
                className={`p-6 border transition-all ${
                  isBreached 
                    ? 'border-2 border-zinc-100 bg-zinc-900' 
                    : isWarning 
                      ? 'border-2 border-dashed border-zinc-400 bg-zinc-950' 
                      : isApproved
                        ? 'border border-zinc-600 bg-zinc-900'
                        : 'border border-zinc-800 bg-zinc-950'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100 font-heading">{approval.approvalType}</h3>
                    <p className="text-xs text-zinc-400">{approval.departmentName}</p>
                  </div>
                  <Badge variant={
                    isApproved ? 'approved' :
                    isBreached ? 'destructive' :
                    isWarning ? 'warning' : 'in_progress'
                  }>
                    {approval.status}
                  </Badge>
                </div>

                {approval.slaInfo && (
                  <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500 uppercase text-[10px]">Statutory SLA Deadline</span>
                    <span className={`font-bold ${
                      isBreached ? 'text-zinc-100 underline' : isWarning ? 'text-zinc-200' : 'text-zinc-400'
                    }`}>
                      {approval.slaInfo.daysLeft !== undefined ? `${approval.slaInfo.daysLeft} Days Remaining` : 'Active'}
                    </span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Joint Inspection Suggestions */}
      {inspections?.inspections?.length > 0 && (
        <Card className="p-6 border-zinc-800 bg-zinc-950 space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-100" />
            <h3 className="text-sm font-bold text-zinc-100 font-heading">
              Joint Site Inspection Coordinated
            </h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {inspections.message || 'Multiple departments require site visits. MAITRI-Setu has grouped them into a single joint inspection.'}
          </p>
          <div className="pt-2 flex items-center gap-3 text-xs font-mono">
            <span className="text-zinc-500">Scheduled Visit Date:</span>
            <span className="font-bold text-zinc-100">
              {inspections.inspections[0].scheduledDate ? new Date(inspections.inspections[0].scheduledDate).toLocaleDateString() : 'TBD'}
            </span>
          </div>
        </Card>
      )}

      {/* Matched Incentives */}
      {incentives?.incentives?.length > 0 && (
        <Card className="p-6 border-zinc-800 bg-zinc-950 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-bold text-zinc-100 font-heading flex items-center gap-2">
              <Award className="w-4 h-4 text-zinc-300" /> Auto-Matched State Industrial Subsidies (PSI 2019)
            </h3>
            <Badge variant="approved" className="text-[10px]">
              {incentives.totalMatched} Schemes Matched
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incentives.incentives.map((inc) => (
              <div key={inc.id} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <h4 className="text-xs font-bold text-zinc-100 font-heading">{inc.schemeName}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{inc.description}</p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-300 font-semibold border-t border-zinc-800/80">
                  <span>Reasoning: Capital & District Category</span>
                  <Badge variant="outline" className="text-[9px]">Auto-Applied</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
