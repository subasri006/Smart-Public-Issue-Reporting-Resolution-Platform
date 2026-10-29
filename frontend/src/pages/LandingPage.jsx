import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { 
  Building2, 
  PlusCircle, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Construction, 
  Trash2, 
  Lightbulb, 
  Droplets, 
  Waves, 
  AlertTriangle, 
  HelpCircle,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';

export const LandingPage = () => {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, catRes, compRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/categories'),
        api.get('/complaints/public-recent?limit=4')
      ]);

      if (sumRes.data?.success) setSummary(sumRes.data.data);
      if (catRes.data?.success) setCategories(catRes.data.data);
      if (compRes.data?.success) setRecentComplaints(compRes.data.data);
    } catch (err) {
      console.error("Error loading landing page data:", err);
      if (!err.response) {
        setError("Unable to connect to live civic services. Please verify that the backend server is running.");
      } else {
        setError("Failed to load civic data from the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCategoryIcon = (code) => {
    switch (code) {
      case 'ROAD': return <Construction className="w-6 h-6 text-amber-600" />;
      case 'GARBAGE': return <Trash2 className="w-6 h-6 text-emerald-600" />;
      case 'LIGHT': return <Lightbulb className="w-6 h-6 text-yellow-500" />;
      case 'WATER': return <Droplets className="w-6 h-6 text-blue-600" />;
      case 'DRAINAGE': return <Waves className="w-6 h-6 text-cyan-600" />;
      case 'SAFETY': return <AlertTriangle className="w-6 h-6 text-rose-600" />;
      default: return <HelpCircle className="w-6 h-6 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-950 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-800/60 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Empowering Responsive Civic Governance
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Spot a City Issue? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-300">
              Report it. Track it. Get it Resolved.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            CivicFix connects citizens directly with municipal staff. From dangerous potholes and burst water mains to dark streetlights, submit reports with GPS accuracy, monitor transparent status milestones, and hold local authorities accountable.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/report"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-base font-bold rounded-xl shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Report an Issue Now
            </Link>
            <Link
              to="/map"
              className="px-6 py-3.5 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-base font-semibold rounded-xl transition flex items-center gap-2"
            >
              <MapPin className="w-5 h-5 text-blue-400" />
              Explore Live City Map
            </Link>
          </div>

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
            <div className="bg-slate-800/50 backdrop-blur-md p-4 rounded-xl border border-slate-700/60 text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {loading ? '...' : (summary ? summary.totalComplaints : 0)}
              </span>
              <p className="text-xs text-slate-400 mt-1">Total Reported Issues</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md p-4 rounded-xl border border-slate-700/60 text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {loading ? '...' : (summary && summary.totalComplaints > 0 ? `${summary.resolutionRate}%` : '0%')}
              </span>
              <p className="text-xs text-slate-400 mt-1">Resolution Rate</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md p-4 rounded-xl border border-slate-700/60 text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                {loading ? '...' : (summary ? (summary.activeUnderRepairCount != null ? summary.activeUnderRepairCount : ((summary.assignedCount || 0) + (summary.inProgressCount || 0))) : 0)}
              </span>
              <p className="text-xs text-slate-400 mt-1">Active Under Repair</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md p-4 rounded-xl border border-slate-700/60 text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-400">
                {loading ? '...' : (summary && summary.resolvedCount > 0 && summary.avgResolutionHours != null ? `${summary.avgResolutionHours}h` : 'N/A')}
              </span>
              <p className="text-xs text-slate-400 mt-1">Avg Resolution Time</p>
            </div>
          </div>

          {error && (
            <div className="max-w-md mx-auto mt-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-center justify-between gap-3">
              <span>{error}</span>
              <button 
                onClick={loadData} 
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium text-[11px] transition"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Transparent Process
          </span>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">How CivicFix Works</h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            From first report to verified field resolution, every single step is tracked with automated priority scoring and audit trails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Snap & Submit</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Capture a photo, pick your exact coordinates on the map, and submit your report in under 60 seconds.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Priority Triage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rule-based scoring calculates severity and age weights. Duplicate similarity detection prevents redundant municipal tickets.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Staff Assigned</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Responsible municipal officer is assigned to the ticket with department instructions and timeline updates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h3 className="text-base font-bold text-slate-900">Verified Resolution</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Staff uploads resolution notes and evidence proof photos. Citizens can reopen if the repair is unsatisfactory.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Issue Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Civic Domains
          </span>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Issues We Address</h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Categorized municipal services mapped directly to dedicated local departments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition flex items-start gap-4"
            >
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                {getCategoryIcon(cat.code)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                  <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    Wt: {cat.weight}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Recent Issues Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recent Community Issues</h2>
            <p className="text-xs text-slate-500 mt-1">Live updates from citizens across the city</p>
          </div>
          {recentComplaints.length > 0 && (
            <Link
              to="/map"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All On Map <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading recent community reports...
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-800">No community issues reported yet.</h3>
              <p className="text-xs text-slate-500">
                Be the first citizen to report a municipal hazard or neighborhood issue.
              </p>
            </div>
            <div>
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                <PlusCircle className="w-4 h-4" />
                Report an Issue Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentComplaints.map((c) => (
              <div key={c.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow transition flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-blue-700">
                      {c.referenceId}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                    {c.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{c.categoryName}</span>
                    <SeverityBadge severity={c.severity} size="sm" />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 truncate max-w-[120px]">{c.landmark || c.address || 'Location recorded'}</span>
                  <Link to={`/complaints/${c.id}`} className="font-semibold text-blue-600 hover:underline">
                    View &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Call to action card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to improve your neighborhood?
            </h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Create a free citizen account today to report public issues, track repairs in real-time, and get notifications upon completion.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-blue-800 hover:bg-blue-50 font-bold text-sm rounded-xl shadow-md transition"
            >
              Sign Up as Citizen
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-blue-900/60 hover:bg-blue-900 text-white font-semibold text-sm rounded-xl border border-blue-400/40 transition"
            >
              Authority Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
