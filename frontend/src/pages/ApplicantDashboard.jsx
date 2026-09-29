import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import toast from 'react-hot-toast';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ChevronRight, 
  AlertCircle,
  Plus,
  ShieldCheck,
  Calendar,
  Award,
  Bell
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function ApplicantDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      const data = Array.isArray(res.data) ? res.data : (res.data?.applications || []);
      setApplications(data);
    } catch {
      toast.error('Failed to load applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 max-w-6xl mx-auto py-8">
        <div className="h-10 w-64 skeleton-pulse rounded-lg"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-24 skeleton-pulse rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  // Stats calculation
  const totalApps = applications.length;
  const activeApps = applications.filter(a => ['submitted', 'in_review'].includes(a.status)).length;
  const approvedApps = applications.filter(a => a.status === 'approved').length;
  const allApprovals = applications.flatMap(a => a.approvals || []);
  const breachedCount = allApprovals.filter(a => a.alertStatus === 'breached' || a.slaInfo?.slaStatus === 'breached').length;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Top Banner Header */}
      <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px]">
              Entrepreneur Portal
            </Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400 font-medium">State of Maharashtra</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-heading">
            Industrial Approvals & Permits Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Single view tracking parallel department clearances, statutory SLA deadlines, and state subsidies.
          </p>
        </div>
        <Link to="/onboarding" id="new-application-btn">
          <Button variant="default" size="lg" className="gap-2">
            <Plus className="w-4 h-4" /> New Project Intake
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 border-zinc-800 bg-zinc-950">
          <div className="text-3xl font-black tracking-tight text-zinc-100 font-heading">{totalApps}</div>
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-1 flex items-center gap-1">
            <FileText className="w-3 h-3 text-zinc-400 inline" /> Total Applications
          </div>
        </Card>
        <Card className="p-5 border-zinc-800 bg-zinc-950">
          <div className="text-3xl font-black tracking-tight text-zinc-100 font-heading">{activeApps}</div>
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-400 inline" /> Under Review
          </div>
        </Card>
        <Card className="p-5 border-zinc-800 bg-zinc-950">
          <div className="text-3xl font-black tracking-tight text-zinc-100 font-heading">{approvedApps}</div>
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-zinc-100 inline" /> Fully Cleared
          </div>
        </Card>
        <Card className="p-5 border-zinc-800 bg-zinc-950">
          <div className="text-3xl font-black tracking-tight text-zinc-100 font-heading">{breachedCount}</div>
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-zinc-100 inline" /> SLA Overdue
          </div>
        </Card>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-zinc-800">
          <CardContent className="space-y-4 pt-6">
            <h3 className="text-lg font-bold text-zinc-100 font-heading">No Project Approvals Active</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Start a new project intake wizard to compute parallel clearance requirements and SLAs.
            </p>
            <Link to="/onboarding">
              <Button variant="default">Start Intake Wizard</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Active Industrial Permits & Parallel Workflow Status
          </h2>

          {applications.map((app, i) => (
            <Link
              to={`/application/${app.id}`}
              key={app.id}
              className="block group"
            >
              <Card className="p-6 border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-zinc-900">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-extrabold text-zinc-100 font-heading">{app.sector}</h3>
                      <Badge variant={
                        app.status === 'approved' ? 'approved' :
                        app.status === 'submitted' ? 'in_progress' : 'secondary'
                      }>
                        {app.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-400">
                      District: <span className="text-zinc-200 font-semibold">{app.location}</span> • Capital: <span className="text-zinc-200 font-semibold">₹{Number(app.investmentSize).toLocaleString()}</span> • Stage: <span className="text-zinc-200 font-semibold">{app.stage}</span>
                    </p>
                  </div>

                  <div className="text-xs font-bold text-zinc-300 group-hover:text-white group-hover:translate-x-1 transition-all flex items-center gap-1">
                    <span>Inspect Clearance Matrix</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Department Clearance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {app.approvals?.map(approval => {
                    const isBreached = approval.alertStatus === 'breached' || approval.slaInfo?.slaStatus === 'breached';
                    const isWarning = approval.alertStatus === 'warning' || approval.slaInfo?.slaStatus === 'warning';
                    const isApproved = approval.status === 'approved';

                    return (
                      <div 
                        key={approval.id} 
                        className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                          isBreached 
                            ? 'bg-zinc-900 border-2 border-zinc-100' 
                            : isWarning 
                              ? 'bg-zinc-950 border-2 border-dashed border-zinc-400' 
                              : isApproved
                                ? 'bg-zinc-900 border border-zinc-600'
                                : 'bg-zinc-950 border border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-zinc-100 truncate">{approval.approvalType}</span>
                          {isApproved ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-100 shrink-0" />
                          ) : isBreached ? (
                            <AlertCircle className="w-3.5 h-3.5 text-zinc-100 shrink-0" />
                          ) : isWarning ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          )}
                        </div>

                        <p className="text-[11px] text-zinc-400 truncate">{approval.departmentName}</p>

                        {approval.slaInfo && (
                          <div className="pt-1 text-[10px] font-bold border-t border-zinc-900 flex items-center justify-between">
                            <span className="text-zinc-500 uppercase">SLA</span>
                            <span className={
                              isBreached ? 'text-zinc-100 font-extrabold underline' :
                              isWarning ? 'text-zinc-200' : 'text-zinc-400'
                            }>
                              {approval.slaInfo.daysLeft !== undefined 
                                ? `${approval.slaInfo.daysLeft}d left` 
                                : 'Active'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
