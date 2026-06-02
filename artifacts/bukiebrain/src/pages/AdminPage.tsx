import { useState, useEffect, useMemo } from "react";
import { supabase, WaitlistEntry, HeroEmailEntry } from "@/supabase";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Download, Search, Users, Mail, MapPin, RefreshCw, LogOut, Gift } from "lucide-react";

const NAVY  = "#0B1D3D";
const GREEN = "#0D3B2E";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "bukieadmin2027";

const ROLE_LABELS: Record<string, string> = {
  local_worker:      "Local Worker",
  remote_freelancer: "Remote Freelancer",
  hire_talent:       "Client (Hiring)",
};

const ROLE_COLORS = ["#0D3B2E", "#0B1D3D", "#1a6b50"];

function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-black/[0.06] p-5 flex items-start gap-4 shadow-sm">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${GREEN}18` }}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5"
          style={{ fontFamily: "Montserrat, sans-serif" }}>{label}</p>
        <p className="text-2xl font-black text-[#0B1D3D]"
          style={{ fontFamily: "Montserrat, sans-serif" }}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authed,   setAuthed]   = useState(() => sessionStorage.getItem("bb-admin") === "1");
  const [password, setPassword] = useState("");
  const [pwError,  setPwError]  = useState(false);

  const [entries,     setEntries]     = useState<WaitlistEntry[]>([]);
  const [heroEmails,  setHeroEmails]  = useState<HeroEmailEntry[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [search,      setSearch]      = useState("");
  const [roleFilter,  setRoleFilter]  = useState("all");
  const [sortField,   setSortField]   = useState<"created_at" | "full_name">("created_at");
  const [sortDir,     setSortDir]     = useState<"asc" | "desc">("desc");

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("bb-admin", "1");
      setAuthed(true);
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 1500);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("bb-admin");
    setAuthed(false);
  };

  const fetchData = async () => {
    setLoading(true);
    const [{ data: wl }, { data: he }] = await Promise.all([
      supabase.from("waitlist").select("*").order("created_at", { ascending: false }),
      supabase.from("hero_emails").select("*").order("created_at", { ascending: false }),
    ]);
    setEntries(wl ?? []);
    setHeroEmails(he ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (authed) fetchData();
  }, [authed]);

  const filtered = useMemo(() => {
    let rows = entries;
    if (roleFilter !== "all") rows = rows.filter(r => r.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        r.full_name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.phone?.includes(q) ||
        r.location?.toLowerCase().includes(q)
      );
    }
    rows = [...rows].sort((a, b) => {
      const av = (a as Record<string, string>)[sortField] ?? "";
      const bv = (b as Record<string, string>)[sortField] ?? "";
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return rows;
  }, [entries, search, roleFilter, sortField, sortDir]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of entries) counts[e.role] = (counts[e.role] ?? 0) + 1;
    return Object.entries(counts).map(([role, count]) => ({
      name: ROLE_LABELS[role] ?? role, value: count,
    }));
  }, [entries]);

  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of entries) {
      const cities = e.preferred_cities?.length ? e.preferred_cities : [e.location];
      for (const c of cities) if (c) counts[c] = (counts[c] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([city, count]) => ({ city, count }));
  }, [entries]);

  const topReferrers = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    for (const e of entries) {
      if (e.referred_by) {
        const referrer = entries.find(r => r.referral_code === e.referred_by);
        const key = e.referred_by;
        counts[key] = counts[key] ?? { name: referrer?.full_name ?? e.referred_by, count: 0 };
        counts[key].count += 1;
      }
    }
    return Object.entries(counts)
      .map(([code, { name, count }]) => ({ code, name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [entries]);

  const signupsByDay = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of entries) {
      const day = e.created_at?.slice(0, 10) ?? "unknown";
      counts[day] = (counts[day] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, count]) => ({ date: date.slice(5), count }));
  }, [entries]);

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Role", "Location", "Cities", "Trade/Specialty", "Referral Code", "Referred By", "Date"];
    const rows = filtered.map(e => [
      e.full_name, e.email, e.phone,
      ROLE_LABELS[e.role] ?? e.role,
      e.location,
      (e.preferred_cities ?? []).join("; "),
      e.trade ?? e.specialty ?? e.help_needed ?? "",
      e.referral_code ?? "",
      e.referred_by ?? "",
      e.created_at?.slice(0, 10) ?? "",
    ].map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `bukiebrain-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (field: "created_at" | "full_name") => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#F7F9FF] flex items-center justify-center px-4"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-black/[0.06] p-8">
          <div className="mb-6 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: `${GREEN}18` }}>
              <Users className="w-7 h-7" style={{ color: GREEN }} />
            </div>
            <h1 className="text-xl font-black text-[#0B1D3D]"
              style={{ fontFamily: "Montserrat, sans-serif" }}>Admin Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">BukieBrain Waitlist</p>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && login()}
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all
                ${pwError ? "border-red-400 bg-red-50 animate-[shake_0.4s_ease-in-out]" : "border-slate-200 focus:border-[#0D3B2E]"}`}
            />
            {pwError && <p className="text-xs text-red-500 text-center">Incorrect password</p>}
            <button
              onClick={login}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
              style={{ background: GREEN, fontFamily: "Montserrat, sans-serif" }}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FF]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div className="border-b border-black/[0.06] bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-black text-[#0B1D3D] text-base" style={{ fontFamily: "Montserrat, sans-serif" }}>
              BukieBrain Admin
            </h1>
            <p className="text-[11px] text-slate-400">Waitlist Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 border border-slate-200 hover:border-slate-300 transition-colors disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 border border-slate-200 hover:border-slate-300 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Users className="w-5 h-5" style={{ color: GREEN }} />}
            label="Total Signups" value={entries.length} sub="Full waitlist entries" />
          <StatCard icon={<Mail className="w-5 h-5" style={{ color: GREEN }} />}
            label="Hero Emails" value={heroEmails.length} sub="Quick email captures" />
          <StatCard icon={<MapPin className="w-5 h-5" style={{ color: GREEN }} />}
            label="Cities" value={new Set(entries.map(e => e.location)).size} sub="Unique locations" />
          <StatCard icon={<Gift className="w-5 h-5" style={{ color: GREEN }} />}
            label="Via Referral"
            value={entries.filter(e => e.referred_by).length}
            sub="Referred signups" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Signups over time */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-black/[0.06] p-6 shadow-sm">
            <h2 className="font-black text-sm text-[#0B1D3D] mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Signups — Last 14 Days
            </h2>
            {signupsByDay.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-sm text-slate-400">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={signupsByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill={GREEN} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Role breakdown */}
          <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-sm">
            <h2 className="font-black text-sm text-[#0B1D3D] mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
              By Role
            </h2>
            {roleCounts.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-sm text-slate-400">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={roleCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name, value }) => `${value}`}>
                    {roleCounts.map((_, i) => <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />)}
                  </Pie>
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Referrers */}
        {topReferrers.length > 0 && (
          <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-sm">
            <h2 className="font-black text-sm text-[#0B1D3D] mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Top Referrers
            </h2>
            <div className="space-y-2">
              {topReferrers.map(({ code, name, count }, i) => (
                <div key={code} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                    style={{ background: i === 0 ? `${GREEN}` : `${GREEN}18`, color: i === 0 ? "#fff" : GREEN }}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-[#0B1D3D] truncate">{name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{code}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${GREEN}18`, color: GREEN }}>
                    {count} {count === 1 ? "referral" : "referrals"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* City breakdown */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-sm">
          <h2 className="font-black text-sm text-[#0B1D3D] mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Top Cities
          </h2>
          {cityCounts.length === 0 ? (
            <p className="text-sm text-slate-400">No data yet</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {cityCounts.map(({ city, count }) => (
                <div key={city} className="rounded-xl border border-black/[0.05] p-3 text-center">
                  <p className="font-black text-lg text-[#0B1D3D]" style={{ fontFamily: "Montserrat, sans-serif" }}>{count}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{city}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-black/[0.05] flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="font-black text-sm text-[#0B1D3D] flex-1" style={{ fontFamily: "Montserrat, sans-serif" }}>
              All Entries ({filtered.length})
            </h2>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, email…"
                  className="pl-8 pr-3 py-1.5 text-xs rounded-full border border-slate-200 outline-none focus:border-[#0D3B2E] w-44"
                />
              </div>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="text-xs rounded-full border border-slate-200 px-3 py-1.5 outline-none focus:border-[#0D3B2E]">
                <option value="all">All Roles</option>
                <option value="local_worker">Local Worker</option>
                <option value="remote_freelancer">Remote Freelancer</option>
                <option value="hire_talent">Client (Hiring)</option>
              </select>
              <button onClick={exportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white transition-all hover:brightness-110"
                style={{ background: GREEN, fontFamily: "Montserrat, sans-serif" }}>
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-black/[0.05]">
                  {[
                    { label: "Name", field: "full_name" as const },
                    { label: "Email", field: null },
                    { label: "Phone", field: null },
                    { label: "Role", field: null },
                    { label: "Location", field: null },
                    { label: "Refs", field: null },
                    { label: "Date", field: "created_at" as const },
                  ].map(({ label, field }) => (
                    <th key={label}
                      onClick={() => field && toggleSort(field)}
                      className={`text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap select-none
                        ${field ? "cursor-pointer hover:text-[#0B1D3D]" : ""}`}
                      style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10 }}>
                      {label}
                      {field && sortField === field && (sortDir === "asc" ? " ↑" : " ↓")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">No entries found</td></tr>
                ) : filtered.map((e, i) => {
                  const referralCount = e.referral_code
                    ? entries.filter(x => x.referred_by === e.referral_code).length
                    : 0;
                  return (
                  <tr key={e.id ?? i} className="border-b border-black/[0.04] hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#0B1D3D] whitespace-nowrap">{e.full_name}</td>
                    <td className="px-4 py-3 text-slate-500">{e.email}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{e.phone}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          background: e.role === "hire_talent" ? `${NAVY}18` : `${GREEN}18`,
                          color: e.role === "hire_talent" ? NAVY : GREEN,
                        }}>
                        {ROLE_LABELS[e.role] ?? e.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{e.location}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {referralCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: `${GREEN}18`, color: GREEN }}>
                          {referralCount}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {e.created_at ? new Date(e.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
