import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
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
  Filter,
  BarChart3,
  UserCheck,
  ShieldCheck,
  Search
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';

const GRAYSCALE_SHADES = ['#f4f4f5', '#a1a1aa', '#71717a', '#3f3f46', '#27272a', '#18181b'];

export default function OfficerDashboard() {
  const [queue, setQueue] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterDepartment, setFilterDepartment] = useState('ALL');

  const fetchData = async () => {
    try {
      const [queueRes, analyticsRes] = await Promise.all([
        api.get('/officer/queue'),
        api.get('/officer/analytics')
      ]);
      const queueData = Array.isArray(queueRes.data?.applications) 
        ? queueRes.data.applications 
        : (Array.isArray(queueRes.data) ? queueRes.data : []);
      setQueue(queueData);
      setAnalytics(analyticsRes.data || null);
    } catch {
      toast.error('Failed to load officer data');
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const deptData = analytics?.departmentStats
    ? Object.entries(analytics.departmentStats).map(([name, count]) => ({ name, count }))
    : [];

  const statusData = analytics?.statusStats
    ? Object.entries(analytics.statusStats).map(([name, value]) => ({ name, value }))
    : [];

  const filteredQueue = filterDepartment === 'ALL'
    ? queue
    : queue.filter(app => app.sector.includes(filterDepartment));

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Institutional Banner Header */}
      <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px]">
              State of Maharashtra
            </Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400 font-medium">MAITRI Officer Intelligence Layer</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-heading">
            Government Departmental Queue & Bottleneck Analytics
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Review pre-validated complete filings, track statutory SLAs, and schedule joint site visits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs py-1 px-3">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 inline" /> Single-Window System Synchronized
          </Badge>
        </div>
      </div>

      {/* High Density Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5 border-zinc-800 bg-zinc-950">
            <div className="text-3xl font-black text-zinc-100 font-heading">{analytics.totalApplications}</div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-1">Total Received</div>
          </Card>
          <Card className="p-5 border-zinc-800 bg-zinc-950">
            <div className="text-3xl font-black text-zinc-100 font-heading">{analytics.pendingApprovals}</div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-1">Pending Clearances</div>
          </Card>
          <Card className="p-5 border-zinc-800 bg-zinc-950">
            <div className="text-3xl font-black text-zinc-100 font-heading">{analytics.warningCount || 0}</div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-1">Near SLA Deadline</div>
          </Card>
          <Card className="p-5 border-zinc-800 bg-zinc-950">
            <div className="text-3xl font-black text-zinc-100 font-heading">{analytics.breachedCount || 0}</div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-1">SLA Breached</div>
          </Card>
        </div>
      )}



      {/* Review Queue Table Section */}
      <Card className="border-zinc-800 bg-zinc-950 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-100 font-heading">Pre-Validated Review Queue</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Filings with completed document OCR pre-validation ready for officer decisioning</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="gov-input !h-8 !text-xs !w-44"
            >
              <option value="ALL" className="bg-zinc-900">All Sectors</option>
              <option value="Manufacturing" className="bg-zinc-900">Manufacturing</option>
              <option value="IT" className="bg-zinc-900">IT/Services</option>
              <option value="Food" className="bg-zinc-900">Food Processing</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Enterprise & Sector</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Investment Scale</th>
                <th className="py-3 px-4">Pre-Validation Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredQueue.map((app) => (
                <tr key={app.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-zinc-100">
                    <div className="font-heading text-sm">{app.sector}</div>
                    <div className="text-[11px] font-normal text-zinc-400">Applicant: {app.user?.name || 'Applicant'}</div>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-300 font-medium">{app.location} District</td>
                  <td className="py-3.5 px-4 text-zinc-300 font-mono">₹{Number(app.investmentSize).toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        app.status === 'approved' ? 'approved' :
                        app.status === 'submitted' ? 'in_progress' : 'secondary'
                      }>
                        {app.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Ready for Review</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link to={`/officer/application/${app.id}`}>
                      <Button variant="outline" size="sm" className="font-bold text-[11px]">
                        Review Filings <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
