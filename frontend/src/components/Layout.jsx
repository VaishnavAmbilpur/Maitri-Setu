import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  FilePlus, 
  ShieldCheck, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  UserCheck 
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function Layout() {
  const { user, logout, isOfficer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const applicantLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/checklist', label: 'New Application', icon: FilePlus },
  ];

  const officerLinks = [
    { to: '/officer', label: 'Command Center', icon: LayoutDashboard },
  ];

  const links = isOfficer ? officerLinks : applicantLinks;

  const getPageTitle = () => {
    if (location.pathname.startsWith('/dashboard')) return 'Applicant Portal';
    if (location.pathname.startsWith('/checklist')) return 'Smart Checklist Generator';
    if (location.pathname.startsWith('/upload')) return 'Document OCR Pre-Validation';
    if (location.pathname.startsWith('/application')) return 'Approval Details';
    if (location.pathname.startsWith('/officer/application')) return 'Application Inspection';
    if (location.pathname.startsWith('/officer')) return 'Government Officer Dashboard';
    return 'MAITRI-Setu';
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full z-40 bg-zinc-950 border-r border-zinc-800 transition-all duration-250 ${
          sidebarOpen ? 'w-64' : 'w-16'
        } flex flex-col`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center font-extrabold text-sm font-heading shrink-0">
              M
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="text-sm font-bold text-zinc-100 font-heading tracking-tight leading-none">
                  MAITRI-Setu
                </h1>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-zinc-400 inline shrink-0" /> Single-Window AI
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                title={!sidebarOpen ? link.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    sidebarOpen ? '' : 'justify-center px-0'
                  } ${
                    isActive
                      ? 'bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span className="truncate">{link.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Sign Out Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 space-y-3">
          {sidebarOpen ? (
            <>
              <div className="px-1 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono font-bold text-zinc-100 flex items-center justify-center shrink-0">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-zinc-200 truncate">{user?.name || 'User'}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-100 shrink-0"></span>
                    <span className="text-[10px] text-zinc-400 font-medium truncate flex items-center gap-1">
                      {user?.role === 'officer' ? (
                        <UserCheck className="w-3 h-3 text-zinc-400 inline shrink-0" />
                      ) : (
                        <Building2 className="w-3 h-3 text-zinc-400 inline shrink-0" />
                      )}
                      {user?.role === 'officer' ? 'Government Officer' : 'Entrepreneur'}
                    </span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border-zinc-800 h-8 font-medium"
              >
                <LogOut className="w-3.5 h-3.5 mr-2 shrink-0" />
                Sign Out
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono font-bold text-zinc-100 flex items-center justify-center shrink-0"
                title={user?.name}
              >
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm" 
                className="w-8 h-8 p-0 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border-zinc-800"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors shadow-md z-50"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-250 ${sidebarOpen ? 'ml-64' : 'ml-16'} flex flex-col min-h-screen`}>
        {/* Top Header Navbar */}
        <header className="sticky top-0 z-30 h-14 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              SIH 2026 • MAITRI-Setu
            </Badge>
            <span className="text-zinc-700">/</span>
            <h2 className="text-xs font-bold text-zinc-200 tracking-tight font-heading">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-100"></span>
              <span className="font-medium">Single-Window Engine Active</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center text-xs font-extrabold font-mono shadow-sm">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

