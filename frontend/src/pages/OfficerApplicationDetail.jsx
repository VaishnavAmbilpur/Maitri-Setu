import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import toast from 'react-hot-toast';
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ArrowLeft, 
  ShieldCheck, 
  XCircle,
  Clock
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

  const getFileUrl = (path) => {
    if (!path) return '#';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const host = baseUrl.replace(/\/api\/?$/, '');
    return `${host}${cleanPath}`;
  };

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
            <Card key={approval.id} className="border-zinc-800 bg-zinc-950 p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-zinc-100 font-heading">{approval.approvalType}</h3>
                  <Badge variant={
                    isApproved ? 'approved' :
                    isRejected ? 'destructive' : 'in_progress'
                  }>
                    {approval.status}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400">{approval.departmentName}</p>

                {doc ? (
                  <div className="pt-2 p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-zinc-300 shrink-0" />
                        <span className="text-zinc-200 font-mono font-bold">{doc.fileName}</span>
                      </div>
                      <a 
                        href={getFileUrl(doc.filePath)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-100 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded border border-zinc-700 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> View / Inspect File
                      </a>
                    </div>
                    
                    {/* OCR Validation Summary */}
                    <div className="flex items-center gap-2 pt-1 border-t border-zinc-800 text-[11px]">
                      {doc.validationStatus === 'passed' ? (
                        <Badge variant="approved" className="gap-1 text-[9px]">
                          <CheckCircle2 className="w-3 h-3 inline text-zinc-950" /> OCR Passed
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="gap-1 text-[9px]">
                          <AlertTriangle className="w-3 h-3 inline" /> Action Needed
                        </Badge>
                      )}
                      {doc.validationNotes && (
                        <span className="text-zinc-400 text-[11px] truncate">{doc.validationNotes}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 text-xs text-zinc-400 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 inline text-zinc-400" /> No document uploaded yet
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 md:self-center">
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
            </Card>
          );
        })}
      </div>
    </div>
  );
}
