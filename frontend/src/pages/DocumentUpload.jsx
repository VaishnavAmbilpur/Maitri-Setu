import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import toast from 'react-hot-toast';
import { 
  FileCheck2, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function DocumentUpload() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchApplication = async () => {
    try {
      const res = await api.get(`/applications/${applicationId}`);
      setApplication(res.data);
    } catch {
      toast.error('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const handleUpload = async (approvalId, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [approvalId]: true }));
    const formData = new FormData();
    formData.append('document', file);

    try {
      await api.post(`/documents/${approvalId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document uploaded & OCR verified');
      fetchApplication();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, [approvalId]: false }));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post(`/applications/${applicationId}/submit`);
      toast.success('Application submitted for processing');
      navigate(`/application/${applicationId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 py-12">
        <div className="h-8 w-64 skeleton-pulse rounded-lg"></div>
        <div className="h-32 w-full skeleton-pulse rounded-xl"></div>
        <div className="h-32 w-full skeleton-pulse rounded-xl"></div>
      </div>
    );
  }

  if (!application) {
    return <div className="text-center py-20 text-zinc-400 font-medium text-xs">Application record not found.</div>;
  }

  const allUploaded = application.approvals?.every(a => a.documents && a.documents.length > 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-[10px]">
            OCR Pre-Validation Layer
          </Badge>
          <span className="text-xs text-zinc-500">•</span>
          <span className="text-xs text-zinc-400 font-medium">{application.sector}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-heading">
          Required Compliance Document Submissions
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          District: {application.location} • Planned Capital: ₹{Number(application.investmentSize).toLocaleString()}
        </p>
      </div>

      {/* Pre-Validation Intelligence Callout Box */}
      <div className="p-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/60 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-zinc-100 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
            Intelligent Document Scrutiny Active
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            MAITRI-Setu automatically verifies file headers, signature presence, and validity before submission—catching errors early so you don't waste time on physical visits or intake rejections.
          </p>
        </div>
      </div>

      {/* Document Slot Cards List */}
      <div className="space-y-4">
        {application.approvals?.map((approval) => {
          const doc = approval.documents?.[0];
          const isUploading = uploading[approval.id];

          return (
            <Card key={approval.id} className="border-zinc-800 bg-zinc-950 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-zinc-100 font-heading">{approval.approvalType}</h3>
                    <span className="text-xs text-zinc-500">({approval.departmentName})</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Mandatory: Statutory Land Title Extract / Identity Verification / Layout Blueprint
                  </p>

                  {doc && (
                    <div className="pt-2 flex items-center gap-2 text-xs">
                      <FileText className="w-4 h-4 text-zinc-300" />
                      <span className="font-mono text-zinc-200">{doc.fileName}</span>
                      {doc.validationStatus === 'passed' ? (
                        <Badge variant="approved" className="gap-1 text-[9px]">
                          <CheckCircle2 className="w-3 h-3 inline" /> OCR Passed
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="gap-1 text-[9px]">
                          <AlertTriangle className="w-3 h-3 inline" /> Action Needed: Review Format
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  <label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="cursor-pointer relative overflow-hidden"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <div className="flex items-center gap-2">
                          <div className="spinner !w-3.5 !h-3.5"></div>
                          <span>Verifying...</span>
                        </div>
                      ) : doc ? (
                        <>Replace File</>
                      ) : (
                        <><UploadCloud className="w-3.5 h-3.5 mr-1.5" /> Upload Document</>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleUpload(approval.id, e.target.files?.[0])}
                        disabled={isUploading}
                        accept=".pdf,.png,.jpg,.jpeg"
                      />
                    </Button>
                  </label>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Submission Final Bar */}
      <Card className="border-zinc-800 bg-zinc-950 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-zinc-100">Ready for Official Transmission?</h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            {allUploaded 
              ? 'All required clearance documents have been uploaded & verified.' 
              : 'Please upload documents for all required approvals before submitting.'}
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!allUploaded || submitting}
          variant="default"
          size="lg"
          className="shrink-0 font-bold"
          id="submit-application-btn"
        >
          {submitting ? <div className="spinner !w-4 !h-4"></div> : <><ShieldCheck className="w-4 h-4 mr-2" /> Submit Application to MAITRI</>}
        </Button>
      </Card>
    </div>
  );
}
