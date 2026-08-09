import { useEffect, useMemo, useState } from "react";
import { supabase, WaitlistEntry, HeroEmailEntry } from "@/supabase";
import { Download, LogIn, LogOut, Mail, MapPin, RefreshCw, Search, ShieldCheck, Users } from "lucide-react";

const GREEN = "#0D3B2E";
const ROLE_LABELS: Record<string, string> = {
  local_worker: "Local Worker",
  remote_freelancer: "Remote Freelancer",
  hire_talent: "Client (Hiring)",
};

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="bg-white rounded-2xl border border-black/[0.06] p-5 flex items-center gap-4 shadow-sm"><div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${GREEN}18` }}>{icon}</div><div><p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p><p className="text-2xl font-black text-[#0B1D3D]">{value}</p></div></div>;
}

export default function AdminPage() {
  const [sessionReady, setSessionReady] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [heroEmails, setHeroEmails] = useState<HeroEmailEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) { setUserEmail(session?.user.email ?? null); setSessionReady(true); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
      setSessionReady(true);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const isAuthenticated = Boolean(userEmail);

  const login = async () => {
    setAuthError("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) { setAuthError("Enter your admin email and password."); return; }
    const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) { setAuthError("Sign-in failed. Check your credentials."); return; }
    setPassword("");
  };

  const logout = async () => { await supabase.auth.signOut(); setEntries([]); setHeroEmails([]); };

  const fetchData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setAuthError("");
    const [{ data: wl, error: wlErr }, { data: he, error: heErr }] = await Promise.all([
      supabase.from("waitlist").select("*").order("created_at", { ascending: false }),
      supabase.from("hero_emails").select("*").order("created_at", { ascending: false }),
    ]);
    if (wlErr) { console.error(wlErr); setEntries([]); setAuthError("Unable to load waitlist data. Your account may not have the admin role."); }
    else setEntries(wl ?? []);
    if (heErr) { console.error(heErr); setHeroEmails([]); }
    else setHeroEmails(he ?? []);
    setLoading(false);
  };

  useEffect(() => { if (isAuthenticated) void fetchData(); }, [isAuthenticated]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(e => [e.full_name, e.email, e.phone, e.location, e.role].some(v => v?.toLowerCase().includes(q)));
  }, [entries, search]);

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Role", "Location", "Cities", "Trade/Specialty", "Referral Code", "Referred By", "Date"];
    const rows = filtered.map(e => [e.full_name, e.email, e.phone, ROLE_LABELS[e.role] ?? e.role, e.location, (e.preferred_cities ?? []).join("; "), e.trade ?? e.specialty ?? e.help_needed ?? "", e.referral_code ?? "", e.referred_by ?? "", e.created_at?.slice(0, 10) ?? ""].map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `bukiebrain-waitlist-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click(); URL.revokeObjectURL(url);
  };

  if (!sessionReady) return <div className="min-h-screen bg-[#F7F9FF] flex items-center justify-center text-sm text-slate-500">Checking secure session…</div>;

  if (!isAuthenticated) return <div className="min-h-screen bg-[#F7F9FF] flex items-center justify-center px-4"><div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-black/[0.06] p-8"><div className="text-center mb-6"><div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${GREEN}18` }}><ShieldCheck className="w-7 h-7" style={{ color: GREEN }} /></div><h1 className="text-xl font-black text-[#0B1D3D]">Secure Admin Sign In</h1><p className="text-sm text-slate-400 mt-1">BukieBrain Waitlist</p></div><div className="space-y-3"><input type="email" autoComplete="username" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && void login()} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0D3B2E] outline-none text-sm" /><input type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && void login()} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0D3B2E] outline-none text-sm" />{authError && <p className="text-xs text-red-500 text-center">{authError}</p>}<button onClick={() => void login()} className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 hover:brightness-110" style={{ background: GREEN }}><LogIn className="w-4 h-4" />Sign In Securely</button></div></div></div>;

  return <div className="min-h-screen bg-[#F7F9FF]"><header className="border-b border-black/[0.06] bg-white sticky top-0 z-10"><div className="max-w-7xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-4"><div><h1 className="font-black text-[#0B1D3D]">BukieBrain Admin</h1><p className="text-[11px] text-slate-400">Authenticated as {userEmail}</p></div><div className="flex items-center gap-2"><button onClick={() => void fetchData()} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 border border-slate-200 disabled:opacity-50"><RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />Refresh</button><button onClick={() => void logout()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 border border-slate-200"><LogOut className="w-3.5 h-3.5" />Sign Out</button></div></div></header><main className="max-w-7xl mx-auto px-5 md:px-10 py-8 space-y-6">{authError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{authError}</div>}<div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><StatCard icon={<Users className="w-5 h-5" style={{ color: GREEN }} />} label="Total Signups" value={entries.length} /><StatCard icon={<Mail className="w-5 h-5" style={{ color: GREEN }} />} label="Hero Emails" value={heroEmails.length} /><StatCard icon={<MapPin className="w-5 h-5" style={{ color: GREEN }} />} label="Locations" value={new Set(entries.map(e => e.location)).size} /><StatCard icon={<Users className="w-5 h-5" style={{ color: GREEN }} />} label="Via Referral" value={entries.filter(e => e.referred_by).length} /></div><section className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden"><div className="p-5 border-b border-black/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3"><div><h2 className="font-black text-[#0B1D3D]">Waitlist</h2><p className="text-xs text-slate-400">Protected by Supabase Auth and database RLS.</p></div><div className="flex gap-2"><div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#0D3B2E]" /></div><button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600"><Download className="w-4 h-4" />Export</button></div></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Location</th><th className="px-5 py-3">Joined</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map(e => <tr key={e.id}><td className="px-5 py-3 font-semibold text-[#0B1D3D]">{e.full_name}</td><td className="px-5 py-3 text-slate-600">{e.email}</td><td className="px-5 py-3 text-slate-600">{e.phone}</td><td className="px-5 py-3 text-slate-600">{ROLE_LABELS[e.role] ?? e.role}</td><td className="px-5 py-3 text-slate-600">{e.location}</td><td className="px-5 py-3 text-slate-500">{e.created_at?.slice(0, 10)}</td></tr>)}{filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">No waitlist entries found.</td></tr>}</tbody></table></div></section></main></div>;
}
