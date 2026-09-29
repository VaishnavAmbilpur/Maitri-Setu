import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getFileUrl } from '../api/client';
import toast from 'react-hot-toast';
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ArrowLeft, 
  ShieldCheck, 
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function OfficerApplicationDetail() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchApplication = async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      setApp(res.data);
    } catch {
      toast.error('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleAction = async (approvalId, status) => {
    setActionLoading(prev => ({ ...prev, [approvalId]: true }));
    try {
      await api.patch(`/officer/approve/${approvalId}`, { status });
      toast.success(`Approval status updated to ${status}`);
      fetchApplication();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [approvalId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 py-12">
        <div className="h-8 w-64 skeleton-pulse rounded-lg"></div>
        <div className="h-32 w-full skeleton-pulse rounded-xl"></div>
      </div>
    );
  }

  if (!app) return <div className="text-center py-20 text-zinc-400 text-xs">Application record not found.</div>;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto font-sans">
      {/* Header Banner */}
      <Card className="border-zinc-800 bg-zinc-950 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-zinc-100 font-heading">{app.sector}</h1>
            <Badge variant={
              app.status === 'approved' ? 'approved' :
              app.status === 'submitted' ? 'in_progress' : 'secondary'
            }>
              {app.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400">
            Applicant: <span className="text-zinc-200 font-bold">{app.user?.name}</span> ({app.user?.email}) • District: <span className="text-zinc-200 font-semibold">{app.location}</span>
          </p>
        </div>

        <Link to="/officer">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="w-4 h-4" /> Return to Queue
          </Button>
        </Link>
      </Card>

      {/* Approval List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
          Departmental Clearances Verification Matrix
        </h2>

        {app.approvals?.map((approval) => {
          const isLoading = actionLoading[approval.id];
          const doc = approval.documents?.[0];
          const isApproved = approval.status === 'approved';
          const isRejected = approval.status === 'rejected';

          return (
            <Card key={approval.id} className="border-zinc-800 bg-zinc-950 p-6 space-y-4">
              {/* Header row: Approval Title + Department + Status Badge + Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-zinc-100 font-heading">{approval.approvalType}</h3>
                    <Badge variant={
                      isApproved ? 'approved' :
                      isRejected ? 'destructive' : 'in_progress'
                    }>
                      {approval.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium">{approval.departmentName}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={() => handleAction(approval.id, 'approved')}
                    disabled={isLoading || isApproved}
                    variant={isApproved ? "secondary" : "default"}
                    size="sm"
                    className="font-bold text-xs"
                  >
                    {isLoading ? <div className="spinner !w-3.5 !h-3.5"></div> : <><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Grant Approval</>}
                  </Button>
                  <Button
                    onClick={() => handleAction(approval.id, 'rejected')}
                    disabled={isLoading || isRejected}
                    variant="destructive"
                    size="sm"
                    className="font-bold text-xs"
                  >
                    {isLoading ? <div className="spinner !w-3.5 !h-3.5"></div> : <><XCircle className="w-3.5 h-3.5 mr-1" /> Reject Clearance</>}
                  </Button>
                </div>
              </div>

              {/* Document Preview & OCR Section */}
              {doc ? (
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center shrink-0 text-zinc-200">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-zinc-200 truncate max-w-xs">{doc.fileName}</span>
                        {doc.validationStatus === 'passed' ? (
                          <Badge variant="approved" className="gap-1 text-[9px] shrink-0">
                            <CheckCircle2 className="w-3 h-3 inline text-zinc-950" /> OCR Passed
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="gap-1 text-[9px] shrink-0">
                            <AlertTriangle className="w-3 h-3 inline" /> Action Needed
                          </Badge>
                        )}
                      </div>
                      {doc.validationNotes && (
                        <p className="text-[11px] text-zinc-400 truncate">{doc.validationNotes}</p>
                      )}
                    </div>
                  </div>

                  <a 
                    href={getFileUrl(doc.filePath)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-zinc-100 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg border border-zinc-700 transition-colors shrink-0 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Inspect Document
                  </a>
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 text-xs text-zinc-500 flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 text-zinc-600 shrink-0" /> No compliance document uploaded yet by applicant
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
