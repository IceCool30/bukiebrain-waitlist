import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  BadgeCheck, Globe, Smartphone, UserCircle, Briefcase, Lock,
  CheckCircle, GraduationCap, MapPin, Link as LinkIcon,
  HelpCircle, Coins, ChevronDown, Sun, Moon, Star, Share2, Copy, Check, Gift,
} from "lucide-react";

import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/supabase";
import logoSrc from "@/bukiebrain-logo-full.jpg";
import avatarMale1 from "@/avatar-male1.jpg";
import avatarMale2 from "@/avatar-male2.jpg";
import avatarFemale from "@/avatar-female.jpg";

// ── Brand tokens ──────────────────────────────────────────
const NAVY  = "#0B1D3D";
const GREEN = "#0D3B2E";

// ── Referral helpers ──────────────────────────────────────
function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
function getReferralLink(code: string): string {
  const base = window.location.origin + window.location.pathname;
  return `${base}?ref=${code}`;
}

// ── Data ─────────────────────────────────────────────────
const LAUNCH_DATE = new Date("2027-01-20T00:00:00+01:00");

const NG_CITIES = [
  "Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan",
  "Enugu", "Benin City", "Warri", "Kaduna", "Owerri", "Calabar", "Uyo",
];

const ROLES = [
  { value: "local_worker",      label: "Find Local Work"  },
  { value: "remote_freelancer", label: "Freelance Online" },
  { value: "hire_talent",       label: "Hire Talent"      },
] as const;
type RoleValue = (typeof ROLES)[number]["value"];
const ROLE_LABELS: Record<RoleValue, string> = {
  local_worker:      "Local Worker",
  remote_freelancer: "Remote Freelancer",
  hire_talent:       "Client (Hiring)",
};

const ALL_BENEFITS = [
  { icon: "🎯", title: "Priority Matching",     desc: "Be first to get matched with clients or workers the moment we launch." },
  { icon: "💬", title: "Chat-First Jobs",        desc: "Get hired via simple chat. No heavy apps, no heavy data usage." },
  { icon: "✅", title: "Verified Profile Badge", desc: "Build a BukiePassport that earns instant trust with every client." },
  { icon: "🌍", title: "Local & Global Reach",   desc: "Work in your neighbourhood or take on remote gigs worldwide." },
  { icon: "🎓", title: "Free Skill Learning",    desc: "Access bite-sized, low-data courses to level up and earn more." },
  { icon: "👑", title: "Founding Member Status", desc: "Exclusive early-access badge and lifetime recognition on your profile." },
  { icon: "🛡️", title: "Secure Transactions",   desc: "Protected payments on every job, so you always get what you're owed." },
];

const TESTIMONIALS = [
  {
    quote:  "Finally a platform built for how Nigeria actually works. The chat-first approach is genius. No data stress, just work.",
    name:   "Chukwuemeka Eze",
    role:   "Freelance Software Developer",
    avatar: avatarMale1,
  },
  {
    quote:  "I found a reliable plumber through the beta in under 10 minutes. This is exactly what the market has been missing.",
    name:   "Hassan Usman",
    role:   "Business Owner, Abuja",
    avatar: avatarMale2,
  },
  {
    quote:  "The verified profiles make it so much easier to trust who you're hiring. Can't wait for the full launch.",
    name:   "Adaeze Okonkwo",
    role:   "HR Manager, Lagos",
    avatar: avatarFemale,
  },
];

const FAQS = [
  { q: "When does BukieBrain launch?",                a: "We are in active development and plan to launch publicly on 20 January 2027. Waitlist members receive early access 48 hours before the public opening." },
  { q: "Is joining the waitlist free?",               a: "Yes, joining the waitlist is completely free. All we need is your name, phone, email, and location." },
  { q: "Who can join the waitlist?",                  a: "Anyone in Nigeria! Whether you're a worker looking for gigs, a freelancer targeting global clients, or a client who needs reliable talent, BukieBrain is built for you." },
  { q: "What kind of jobs and skills are available?", a: "Everything from cleaners, chefs, stylists and mechanics to designers, writers and software developers. Local work, remote freelancing and everything in between." },
  { q: "Does BukieBrain work on basic smartphones?",  a: "Yes! Our chat-first, low-data design means BukieBrain works smoothly on any smartphone, even on slow connections across Nigeria." },
];

// ── Form schema ───────────────────────────────────────────
const schema = z.object({
  fullName:    z.string().min(2,  "Name must be at least 2 characters"),
  phone:       z.string().min(7,  "Please enter a valid phone number"),
  email:       z.string().email( "Please enter a valid email address"),
  location:    z.string().min(2,  "Location is required"),
  role:        z.enum(["local_worker", "remote_freelancer", "hire_talent"]),
  trade:       z.string().optional(),
  serviceArea: z.string().optional(),
  specialty:   z.string().optional(),
  portfolio:   z.string().optional(),
  helpNeeded:  z.string().optional(),
  budget:      z.string().optional(),
  city:        z.string().optional(),
});
type FormValues = z.infer<typeof schema>;
const springBounce = { type: "spring" as const, stiffness: 420, damping: 22 };

// ── Hooks ─────────────────────────────────────────────────
function useCountdown(target: Date) {
  const [t, setT] = useState({ days: "00", hrs: "00", mins: "00", secs: "00" });
  useEffect(() => {
    const pad  = (n: number) => String(n).padStart(2, "0");
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setT({
        days: pad(Math.floor(diff / 86_400_000)),
        hrs:  pad(Math.floor((diff % 86_400_000) / 3_600_000)),
        mins: pad(Math.floor((diff % 3_600_000)  /    60_000)),
        secs: pad(Math.floor((diff %    60_000)  /     1_000)),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

function useTypewriter(text: string, speed = 75, pause = 5000) {
  const [display, setDisplay] = useState("");
  const [blink,   setBlink]   = useState(true);
  useEffect(() => {
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;
    function type() {
      setDisplay(text.slice(0, i));
      if (i < text.length) { i++; timeout = setTimeout(type, speed); }
      else                  { timeout = setTimeout(() => { i = 0; type(); }, pause); }
    }
    type();
    return () => clearTimeout(timeout);
  }, [text, speed, pause]);
  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(id);
  }, []);
  return { display, blink };
}

function useHideOnScroll() {
  const [visible, setVisible] = useState(true);
  const lastY    = useRef(0);
  const ticking  = useRef(false);
  const timer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if      (y < 60)                   setVisible(true);
        else if (y > lastY.current + 4)    setVisible(false);
        else if (y < lastY.current - 4)    setVisible(true);
        lastY.current   = y;
        ticking.current = false;
        if (timer.current) clearTimeout(timer.current);
        timer.current   = setTimeout(() => setVisible(true), 600);
      });
      ticking.current = true;
    }
  }, []);
  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [onScroll]);
  return visible;
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? window.scrollY / total : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
}

// ── Count-up component ────────────────────────────────────
function CountUp({ to, duration = 1800, suffix = "" }: { to: number; duration?: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref    = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.5 });
  useEffect(() => {
    if (!inView) { setVal(0); return; }
    const start = Date.now();
    const tick  = () => {
      const pct   = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setVal(Math.floor(eased * to));
      if (pct < 1) requestAnimationFrame(tick);
      else         setVal(to);
    };
    requestAnimationFrame(tick);
  }, [inView, to, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Shared UI atoms ───────────────────────────────────────
function Reveal({ children, delay = 0, className = "", id }: {
  children: React.ReactNode; delay?: number; className?: string; id?: string;
}) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.12 });
  return (
    <motion.div ref={ref} id={id} className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function Logo({ height = "h-8" }: { height?: string }) {
  return (
    <span className="inline-flex items-center bg-white rounded-lg px-2 py-0.5">
      <img src={logoSrc} alt="BukieBrain" className={`${height} w-auto object-contain`} decoding="async" />
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="block font-bold uppercase tracking-[0.2em] text-[10px] mb-3 text-[#0D3B2E] dark:text-white/60"
      style={{ fontFamily: "Montserrat, sans-serif" }}>
      {children}
    </span>
  );
}

function SectionH2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`font-black tracking-tight text-[#0B1D3D] dark:text-white ${className}`}
      style={{ fontFamily: "Montserrat, sans-serif", fontSize: "clamp(26px,4vw,36px)" }}>
      {children}
    </h2>
  );
}

function CdBlock({ val, label }: { val: string; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-[14px] px-4 sm:px-5 py-3 min-w-[58px] sm:min-w-[68px] bg-[#0B1D3D]/10 dark:bg-white/10 border border-[#0B1D3D]/20 dark:border-white/20">
      <span className="text-[#0B1D3D] dark:text-white leading-none"
        style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(20px,4.5vw,30px)", letterSpacing: "-0.02em" }}>
        {val}
      </span>
      <span className="mt-1 uppercase text-[#0B1D3D]/50 dark:text-white/50"
        style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: "0.15em" }}>
        {label}
      </span>
    </div>
  );
}

function StepCard({ icon, num, title, desc }: { icon: string; num: string; title: string; desc: string }) {
  return (
    <div className="bg-white dark:bg-[#102348] border border-black/[0.05] dark:border-white/[0.08] rounded-[20px] p-6 flex gap-4 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
      <div className="w-12 h-12 rounded-[12px] flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: `${GREEN}22` }}>{icon}</div>
      <div>
        <span className="font-black text-[10px] tracking-widest text-[#0D3B2E] dark:text-white/60"
          style={{ fontFamily: "Montserrat, sans-serif" }}>{num}</span>
        <h4 className="font-bold text-[15px] mt-0.5 mb-1"
          style={{ fontFamily: "Montserrat, sans-serif" }}>{title}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white dark:bg-[#102348]/80 border border-black/[0.05] dark:border-white/[0.08] rounded-[20px] p-6 flex gap-4 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-[#0D3B2E]/30 dark:hover:border-white/20 transition-all duration-300">
      <div className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0"
        style={{ background: `${GREEN}22` }}>{icon}</div>
      <div>
        <h4 className="font-bold text-[15px] mb-1"
          style={{ fontFamily: "Montserrat, sans-serif" }}>{title}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────
export default function WaitlistPage() {
  const [submitted,      setSubmitted]      = useState(false);
  const [submittedRole,  setSubmittedRole]  = useState<RoleValue>("local_worker");
  const [overlayOpen,    setOverlayOpen]    = useState(false);
  const [toastVisible,   setToastVisible]   = useState(false);
  const [toastMsg,       setToastMsg]       = useState("Successfully joined the waitlist!");
  const [openFaq,        setOpenFaq]        = useState<number | null>(null);
  const [heroEmail,      setHeroEmail]      = useState("");
  const [heroError,      setHeroError]      = useState(false);
  const [isDark,         setIsDark]         = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [isSaving,       setIsSaving]       = useState(false);
  const [saveError,      setSaveError]      = useState<string | null>(null);
  const [myRefCode,      setMyRefCode]      = useState<string>("");
  const [refCount,       setRefCount]       = useState<number>(0);
  const [copied,         setCopied]         = useState(false);
  const [inboundRef,     setInboundRef]     = useState<string>("");
  const [cookieConsent,  setCookieConsent]  = useState<"accepted" | "declined" | null>(() => {
    const v = localStorage.getItem("bukiebrain-cookie-consent");
    return (v === "accepted" || v === "declined") ? v : null;
  });

  const toggleCity = (city: string) =>
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );

  const navVisible = useHideOnScroll();
  const countdown  = useCountdown(LAUNCH_DATE);
  const scrollPct  = useScrollProgress();
  const { display: badge, blink } = useTypewriter("LAUNCHING ACROSS NIGERIA SOON");

  const particles = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x:        20 + Math.random() * 60,
    y:        10 + Math.random() * 80,
    size:      2 + Math.random() * 4,
    duration:  8 + Math.random() * 12,
    delay:     Math.random() * 5,
  })), []);

  // System theme detection + manual override
  useEffect(() => {
    const root  = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const saved = localStorage.getItem("bukiebrain-theme");
    const dark  = saved ? saved === "dark" : media.matches;
    root.classList.toggle("dark", dark);
    setIsDark(dark);
    const listener = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("bukiebrain-theme")) {
        root.classList.toggle("dark", e.matches);
        setIsDark(e.matches);
      }
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    setIsDark(next);
    localStorage.setItem("bukiebrain-theme", next ? "dark" : "light");
  };

  // Overlay escape + scroll lock
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOverlayOpen(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => {
    document.body.style.overflow = overlayOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [overlayOpen]);

  // Read inbound referral code from URL
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setInboundRef(ref.toUpperCase());
  }, []);

  const scrollTo  = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const showToast = (msg?: string) => {
    if (msg) setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4000);
  };

  // Hero quick-capture
  const submitHeroEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(heroEmail.trim())) {
      setHeroError(true);
      setTimeout(() => setHeroError(false), 1500);
      return;
    }
    const email = heroEmail.trim();
    await supabase.from("hero_emails").insert({ email });
    form.setValue("email", email);
    setHeroEmail("");
    scrollTo("join-section");
  };

  // Full form
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "", phone: "", email: "", location: "",
      role: "local_worker",
      trade: "", serviceArea: "", specialty: "", portfolio: "", helpNeeded: "", budget: "",
    },
  });
  const selectedRole = form.watch("role");

  async function onSubmit(v: FormValues) {
    setIsSaving(true);
    setSaveError(null);
    const code = generateCode();

    // Try insert with referral columns (graceful fallback if DB doesn't have them yet)
    let error: unknown | null = null;
    let result: { error: unknown | null };
    result = await supabase.from("waitlist").insert({
      full_name:        v.fullName,
      phone:            v.phone,
      email:            v.email,
      location:         v.location,
      role:             v.role,
      preferred_cities: selectedCities,
      trade:            v.trade    || undefined,
      service_area:     v.serviceArea || undefined,
      specialty:        v.specialty   || undefined,
      portfolio:        v.portfolio   || undefined,
      help_needed:      v.helpNeeded  || undefined,
      budget:           v.budget      || undefined,
      referral_code:    code,
      referred_by:      inboundRef || undefined,
    });
    error = result.error;

    // If columns don't exist yet, retry without them
    if (error && typeof error === "object" && (error as Record<string, string>).code === "42703") {
      result = await supabase.from("waitlist").insert({
        full_name:        v.fullName,
        phone:            v.phone,
        email:            v.email,
        location:         v.location,
        role:             v.role,
        preferred_cities: selectedCities,
        trade:            v.trade    || undefined,
        service_area:     v.serviceArea || undefined,
        specialty:        v.specialty   || undefined,
        portfolio:        v.portfolio   || undefined,
        help_needed:      v.helpNeeded  || undefined,
        budget:           v.budget      || undefined,
      });
      error = result.error;
    }

    setIsSaving(false);
    if (error) {
      console.error("Waitlist insert error:", error);
      setSaveError("Something went wrong. Please try again.");
      return;
    }
    setMyRefCode(code);
    setRefCount(0);
    setSubmittedRole(v.role);
    setSubmitted(true);
    showToast();
  }

  const primaryBtn = {
    background: GREEN,
    boxShadow:  `0 10px 30px ${GREEN}4D`,
    fontFamily: "Montserrat, sans-serif",
  };

  const acceptCookies = (choice: "accepted" | "declined") => {
    localStorage.setItem("bukiebrain-cookie-consent", choice);
    setCookieConsent(choice);
  };

  const handleShare = () => {
    const text = "I'm joining BukieBrain, Nigeria's Chat-First Job Marketplace! Secure your spot: " + window.location.href;
    if (navigator.share) {
      navigator.share({ title: "BukieBrain Waitlist", text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      showToast("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FF] dark:bg-[#071527] text-[#0B1D3D] dark:text-white overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── SCROLL PROGRESS BAR ─── */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none">
        <div className="h-full transition-none"
          style={{
            width: `${scrollPct * 100}%`,
            background: `linear-gradient(90deg, ${NAVY}, ${GREEN})`,
          }} />
      </div>

      {/* ── NAV ─────────────────────────────────────────── */}
      <motion.nav
        className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] dark:border-white/10 bg-white/95 dark:bg-[#071527]/95 backdrop-blur-md transition-colors duration-300"
        animate={{ y: navVisible ? 0 : "-100%" }}
        transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}>
        <div className="max-w-6xl mx-auto px-5 md:px-10 h-[68px] flex items-center justify-between relative">
          <div className="flex flex-col gap-0.5">
            <Logo />
            <span className="text-[8px] font-bold tracking-[0.18em] uppercase text-[#0B1D3D]/60 dark:text-white/60"
              style={{ fontFamily: "Montserrat, sans-serif" }}>
              Chat-First Job Marketplace
            </span>
          </div>
          <span className="hidden md:block absolute left-1/2 -translate-x-1/2 text-[9px] font-medium text-[#0B1D3D]/30 dark:text-white/30 pointer-events-none whitespace-nowrap"
            style={{ fontFamily: "Montserrat, sans-serif", letterSpacing: "0.04em" }}>
            BukieBrain is powered by Bukie Digital Solutions
          </span>
          <div className="flex items-center gap-3">
            <a href="#join-section"
              className="hidden sm:block text-sm font-medium text-[#0B1D3D]/70 dark:text-white/70 hover:text-[#0B1D3D] dark:hover:text-white transition-colors">
              Join Waitlist
            </a>
            <button onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-[#0B1D3D] dark:text-white text-[11px] font-bold tracking-wide transition-colors hover:brightness-110"
              style={{ fontFamily: "Montserrat, sans-serif", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}>
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
            </button>
          </div>
        </div>
      </motion.nav>

      <main>
        {/* ── HERO ────────────────────────────────────────── */}
        <section className="relative overflow-hidden text-[#0B1D3D] dark:text-white pt-[92px] pb-12 bg-[#F7F9FF] dark:bg-[#071527] transition-colors duration-300">
          {/* Radial glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 80% 60% at 50% 10%, ${GREEN}18 0%, transparent 70%)` }} />

          {/* Ambient floating particles */}
          {particles.map(p => (
            <motion.div key={p.id}
              className="absolute rounded-full pointer-events-none"
              style={{ width: p.size, height: p.size, background: GREEN, opacity: 0.12,
                left: `${p.x}%`, top: `${p.y}%`, filter: "blur(1px)" }}
              animate={{ y: [0, -30, 0], x: [0, 10, 0], opacity: [0.06, 0.18, 0.06] }}
              transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
            />
          ))}

          <div className="relative max-w-3xl mx-auto px-5 md:px-10 flex flex-col items-center text-center gap-7">

            {/* Typewriter badge */}
            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-[#0B1D3D] dark:text-white"
              style={{
                fontFamily:  "Montserrat, sans-serif",
                background:  isDark ? "rgba(255,255,255,0.05)" : `rgba(11,29,61,0.07)`,
                border:      `1px solid ${isDark ? "rgba(255,255,255,0.14)" : "rgba(11,29,61,0.18)"}`,
                boxShadow:   `0 0 28px ${GREEN}22`,
              }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0 bg-[#0D3B2E] dark:bg-white animate-pulse" />
              <span style={{ minWidth: 230 }}>{badge}</span>
              <span className="inline-block w-0.5 h-3.5 rounded-sm align-middle bg-[#0D3B2E] dark:bg-white"
                style={{ opacity: blink ? 1 : 0 }} />
            </motion.div>

            {/* Countdown */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {[
                { val: countdown.days, label: "Days"  },
                { val: countdown.hrs,  label: "Hrs"   },
                { val: countdown.mins, label: "Mins"  },
                { val: countdown.secs, label: "Secs"  },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-2.5">
                  <CdBlock val={item.val} label={item.label} />
                  {i < 3 && (
                    <span className="text-2xl font-black mb-3 flex-shrink-0 text-[#0B1D3D]/30 dark:text-white/30"
                      style={{ fontFamily: "Montserrat, sans-serif" }}>
                      :
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* H1 */}
            <h1 className="font-black leading-[1.1] tracking-tight"
              style={{ fontFamily: "Montserrat, sans-serif", fontSize: "clamp(30px,6.5vw,56px)" }}>
              Nigeria&apos;s{" "}
              <span style={{ color: GREEN }}>Chat-First</span>
              {" "}Job Marketplace
            </h1>

            <p className="text-[#0B1D3D]/70 dark:text-white/70 text-base sm:text-lg max-w-xl leading-relaxed -mt-2">
              BukieBrain connects workers, freelancers, and clients through simple chat.
              No heavy apps, no heavy data, built for every Nigerian.
            </p>

            {/* Email quick-capture */}
            <form onSubmit={submitHeroEmail} className="flex gap-2 w-full max-w-[420px]">
              <input
                type="email"
                value={heroEmail}
                onChange={e => setHeroEmail(e.target.value)}
                placeholder="your@email.com"
                className={`flex-1 px-4 py-3.5 rounded-[14px] text-[#0B1D3D] dark:text-white text-sm outline-none transition-all ${heroError ? "animate-shake" : ""}`}
                style={{
                  background: "white",
                  border: `1.5px solid ${heroError ? GREEN : "rgba(0,0,0,0.20)"}`,
                }}
                onFocus={e => e.currentTarget.style.border = `1.5px solid ${GREEN}`}
                onBlur={e  => e.currentTarget.style.border  = `1.5px solid ${heroError ? GREEN : "rgba(0,0,0,0.20)"}`}
              />
              <button type="submit"
                className="px-5 py-3.5 rounded-[14px] font-black text-[13px] tracking-wide text-white whitespace-nowrap transition-all hover:-translate-y-0.5 hover:brightness-110"
                style={{ fontFamily: "Montserrat, sans-serif", background: GREEN, boxShadow: `0 8px 24px ${GREEN}55` }}>
                NOTIFY ME
              </button>
            </form>
            <p className="text-[#0B1D3D]/40 dark:text-white/40 text-[11px] font-semibold -mt-3">
              <span style={{ color: GREEN }}>100+</span> founding slots still available
            </p>

            {/* Benefit preview card */}
            <div className="w-full max-w-[400px] text-left rounded-3xl p-6"
              style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.08)" }}>
              {ALL_BENEFITS.slice(0, 3).map((b, i) => (
                <div key={i} className="flex items-center gap-4 py-3"
                  style={{ borderBottom: i < 2 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: `${NAVY}14` }}>{b.icon}</div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0B1D3D] dark:text-white">{b.title}</h4>
                    <p className="text-xs text-[#0B1D3D]/60 dark:text-white/60 mt-0.5 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
              <button onClick={() => setOverlayOpen(true)}
                className="w-full mt-4 py-3.5 rounded-[14px] text-[#0B1D3D] dark:text-white font-bold text-xs transition-colors hover:brightness-95"
                style={{ fontFamily: "Montserrat, sans-serif", background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.08)" }}>
                See all {ALL_BENEFITS.length} waitlist benefits &rarr;
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3">
              <div className="flex">
                {[avatarMale1, avatarFemale, avatarMale2].map((src, i) => (
                  <img key={i} src={src} alt="" loading="lazy"
                    className="w-8 h-8 rounded-full object-cover"
                    style={{ border: "2px solid rgba(0,0,0,0.15)", marginLeft: i > 0 ? -10 : 0 }} />
                ))}
              </div>
              <span className="text-sm text-[#0B1D3D]/80 dark:text-white/90 font-medium">
                Trusted by{" "}
                <strong className="text-[#0B1D3D] dark:text-white">
                  <CountUp to={4300} suffix="+" duration={1600} />
                </strong>{" "}
                early registrations
              </span>
            </div>
            <p className="text-[11px] font-semibold text-[#0B1D3D]/50 dark:text-white/50 -mt-5">
              Joined so far, be part of the founding wave
            </p>

            {/* Share link */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wide text-[#0B1D3D]/60 dark:text-white/60 hover:text-[#0B1D3D] dark:hover:text-white transition-all"
              style={{ fontFamily: "Montserrat, sans-serif" }}>
              <Share2 className="w-3.5 h-3.5" />
              Spread the Word
            </motion.button>

            {/* Bouncing scroll arrow */}
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="mt-2 opacity-40">
              <ChevronDown className="w-6 h-6 text-[#0B1D3D] dark:text-white" />
            </motion.div>
          </div>
        </section>

        {/* ── HOW IT WORKS + FORM ────────────────────────── */}
        <section id="join-section" className="py-12 px-5 md:px-10 bg-[#F7F9FF] dark:bg-[#071527]">
          <div className="max-w-6xl mx-auto">

            <Reveal className="text-center mb-5">
              <Tag>How it works</Tag>
              <SectionH2>Get Exclusive Access</SectionH2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
              <Reveal delay={0}>
                <StepCard icon="📋" num="01" title="Join the Waitlist"
                  desc="Fill in your details and secure your founding member spot for free." />
              </Reveal>
              <Reveal delay={0.1}>
                <StepCard icon="🔔" num="02" title="Early Notification"
                  desc="We'll send you an invite link 48 hours before public launch." />
              </Reveal>
              <Reveal delay={0.2}>
                <StepCard icon="⭐" num="03" title="Experience BukieBrain"
                  desc="Find work or hire trusted talent through simple, fast chat." />
              </Reveal>
            </div>

            {/* Sidebar + Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start">

              {/* Sticky sidebar */}
              <Reveal className="lg:sticky lg:top-24 space-y-9">
                <div>
                  <Tag>Your spot is waiting</Tag>
                  <SectionH2 className="mb-3">Join the Future of Work</SectionH2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Be first to know when we open in your city and get exclusive founding member benefits.
                  </p>
                </div>

                {/* Progress steps */}
                <div className="space-y-6 relative">
                  <div className="absolute left-6 top-4 bottom-4 w-0.5"
                    style={{ background: `linear-gradient(to bottom, ${GREEN}80, rgba(200,210,220,0.4), transparent)` }} />
                  {[
                    { n: 1, active: true,  title: "Fill Your Details",  desc: "Name, phone, email and location. Takes under 2 minutes." },
                    { n: 2, active: false, title: "Pick Your Role",      desc: "Worker, freelancer or hiring? We tailor your experience." },
                    { n: 3, active: false, title: "You're Secured",      desc: "On the list. We'll reach out before anyone else." },
                  ].map((step, i) => (
                    <Reveal key={step.n} delay={i * 0.1} className="relative flex items-start gap-5">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full z-10 shrink-0 bg-[#F7F9FF] dark:bg-[#071527]"
                        style={{
                          border: `3px solid ${step.active ? GREEN : "#cbd5e1"}`,
                          boxShadow: step.active ? `0 0 16px -3px ${GREEN}80` : "none",
                        }}>
                        <span className="font-black text-sm"
                          style={{ fontFamily: "Montserrat, sans-serif", color: step.active ? GREEN : "#94a3b8" }}>
                          {step.n}
                        </span>
                      </div>
                      <div className="pt-2.5">
                        <h4 className="font-bold text-base mb-1" style={{ fontFamily: "Montserrat, sans-serif" }}>{step.title}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{step.desc}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </Reveal>

              {/* Full waitlist form */}
              <Reveal id="waitlist-form">
                <div className="bg-white dark:bg-[#102348] border border-black/[0.05] dark:border-white/[0.08] rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30 p-7 sm:p-9">
                  <AnimatePresence mode="wait">
                    {submitted ? (
                      <motion.div key="success" className="text-center py-10 space-y-5"
                        initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }} transition={springBounce}>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ ...springBounce, delay: 0.08 }}
                          className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
                          style={{ background: `${GREEN}1A` }}>
                          <CheckCircle className="w-10 h-10" style={{ color: GREEN }} />
                        </motion.div>
                        <h3 className="font-black text-2xl" style={{ fontFamily: "Montserrat, sans-serif" }}>
                          You&apos;re on the list!
                        </h3>
                        <div className="inline-flex items-center gap-2 font-semibold px-4 py-1.5 rounded-full text-sm"
                          style={{ background: `${GREEN}1A`, border: `1px solid ${GREEN}4D`, color: GREEN }}>
                          Registered as: {ROLE_LABELS[submittedRole]}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
                          We&apos;ve saved your spot. We&apos;ll reach you with early access and launch news.
                        </p>

                        {/* Referral card */}
                        <motion.div
                          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ ...springBounce, delay: 0.2 }}
                          className="mx-auto max-w-sm rounded-2xl border p-5 text-left space-y-3"
                          style={{ background: `${NAVY}08`, borderColor: `${NAVY}18` }}>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: `${GREEN}1A` }}>
                              <Gift className="w-4 h-4" style={{ color: GREEN }} />
                            </div>
                            <div>
                              <p className="font-bold text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>
                                Move Up the Queue
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Each friend who joins bumps you higher
                              </p>
                            </div>
                            {refCount > 0 && (
                              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ background: `${GREEN}1A`, color: GREEN }}>
                                {refCount} referred
                              </span>
                            )}
                          </div>

                          {/* Link box */}
                          <div className="flex items-center gap-2 rounded-xl border bg-white dark:bg-white/5 px-3 py-2"
                            style={{ borderColor: `${NAVY}20` }}>
                            <span className="flex-1 text-xs font-mono text-slate-600 dark:text-slate-300 truncate select-all">
                              {myRefCode ? getReferralLink(myRefCode) : "generating…"}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.92 }}
                              onClick={() => {
                                if (!myRefCode) return;
                                navigator.clipboard.writeText(getReferralLink(myRefCode));
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-colors"
                              style={{ background: copied ? `${GREEN}1A` : `${NAVY}0F`, color: copied ? GREEN : NAVY }}>
                              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {copied ? "Copied!" : "Copy"}
                            </motion.button>
                          </div>
                        </motion.div>

                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            const link = myRefCode ? getReferralLink(myRefCode) : window.location.href;
                            const text = `I just joined the BukieBrain waitlist — Nigeria's Chat-First Job Marketplace! Use my link to join and we both move up the queue: ${link}`;
                            if (navigator.share) {
                              navigator.share({ title: "BukieBrain Waitlist", text, url: link });
                            } else {
                              navigator.clipboard.writeText(text);
                              showToast("Message copied to clipboard!");
                            }
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
                          style={{ background: NAVY, fontFamily: "Montserrat, sans-serif" }}>
                          <Share2 className="w-4 h-4" />
                          Share Your Link
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                            <FormField control={form.control} name="fullName" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold text-sm">Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Chidi Okeke" className="h-11 rounded-xl" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-semibold text-sm">Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="0801 234 5678" type="tel" className="h-11 rounded-xl" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-semibold text-sm">Email Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="chidi@example.com" type="email" className="h-11 rounded-xl" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                            </div>

                            <FormField control={form.control} name="location" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold text-sm">Location (City / State)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Lagos, Nigeria" className="h-11 rounded-xl" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />

                            {/* City launch selector */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="font-semibold text-sm flex items-center gap-2">
                                  <MapPin className="w-4 h-4" style={{ color: GREEN }} />
                                  Notify me when you launch near
                                </label>
                                {selectedCities.length > 0 && (
                                  <button type="button" onClick={() => setSelectedCities([])}
                                    className="text-[10px] font-bold uppercase tracking-wide transition-colors hover:opacity-70"
                                    style={{ color: GREEN }}>
                                    Clear all
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 -mt-1">Pick the cities you care about. We'll send a targeted alert.</p>
                              <div className="flex flex-wrap gap-2 pt-1">
                                {NG_CITIES.map(city => {
                                  const active = selectedCities.includes(city);
                                  return (
                                    <motion.button key={city} type="button"
                                      onClick={() => toggleCity(city)}
                                      whileTap={{ scale: 0.93 }}
                                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                                      style={active ? {
                                        background: GREEN, color: "#fff",
                                        boxShadow: `0 2px 12px ${GREEN}40`,
                                        border: `1.5px solid ${GREEN}`,
                                      } : {
                                        background: "transparent", color: "inherit",
                                        border: "1.5px solid rgb(203 213 225)", opacity: 0.75,
                                      }}>
                                      {active && <span className="mr-1">&#10003;</span>}{city}
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Role toggle with animated pill */}
                            <FormField control={form.control} name="role" render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="font-semibold text-sm">I want to&hellip;</FormLabel>
                                <FormControl>
                                  <div className="relative grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                    {ROLES.map(role => {
                                      const sel = field.value === role.value;
                                      return (
                                        <button key={role.value} type="button"
                                          onClick={() => field.onChange(role.value)}
                                          className="relative z-10 py-2.5 px-1 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold focus:outline-none transition-colors">
                                          {sel && (
                                            <motion.span layoutId="role-pill"
                                              className="absolute inset-0 rounded-lg shadow-md"
                                              style={{ background: GREEN, boxShadow: `0 4px 14px ${GREEN}33` }}
                                              transition={springBounce} />
                                          )}
                                          <span className={`relative z-10 leading-snug ${sel ? "text-white" : "text-slate-500 dark:text-slate-400"}`}>
                                            {role.label}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />

                            {/* Dynamic role fields */}
                            <AnimatePresence mode="wait">
                              {selectedRole === "local_worker" && (
                                <motion.div key="local_worker"
                                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: "easeOut" }}
                                  className="space-y-4 rounded-xl p-4"
                                  style={{ background: `${GREEN}0D`, border: `1px solid ${GREEN}40` }}>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#0D3B2E] dark:text-white/60"
                                    style={{ fontFamily: "Montserrat, sans-serif" }}>
                                    Local Worker Details
                                  </p>
                                  <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold mb-1.5">
                                      <Briefcase className="w-4 h-4" style={{ color: GREEN }} /> Your Trade or Skill
                                    </label>
                                    <Input placeholder="e.g. Plumber, Chef, Cleaner, Mechanic" className="h-11 rounded-xl" {...form.register("trade")} />
                                  </div>
                                  <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold mb-1.5">
                                      <MapPin className="w-4 h-4" style={{ color: GREEN }} /> Service Area / Neighbourhood
                                    </label>
                                    <Input placeholder="e.g. Ikeja, Surulere, Yaba" className="h-11 rounded-xl" {...form.register("serviceArea")} />
                                  </div>
                                </motion.div>
                              )}
                              {selectedRole === "remote_freelancer" && (
                                <motion.div key="remote_freelancer"
                                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: "easeOut" }}
                                  className="space-y-4 rounded-xl p-4"
                                  style={{ background: `${GREEN}0D`, border: `1px solid ${GREEN}40` }}>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#0D3B2E] dark:text-white/60"
                                    style={{ fontFamily: "Montserrat, sans-serif" }}>
                                    Remote Freelancer Details
                                  </p>
                                  <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold mb-1.5">
                                      <Briefcase className="w-4 h-4" style={{ color: GREEN }} /> Main Skill or Specialty
                                    </label>
                                    <Input placeholder="e.g. Graphic Design, Software Dev, Writing" className="h-11 rounded-xl" {...form.register("specialty")} />
                                  </div>
                                  <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold mb-1.5">
                                      <LinkIcon className="w-4 h-4" style={{ color: GREEN }} />
                                      Portfolio or LinkedIn
                                      <span className="text-slate-400 font-normal text-xs">(optional)</span>
                                    </label>
                                    <Input placeholder="https://..." className="h-11 rounded-xl" {...form.register("portfolio")} />
                                  </div>
                                </motion.div>
                              )}
                              {selectedRole === "hire_talent" && (
                                <motion.div key="hire_talent"
                                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: "easeOut" }}
                                  className="space-y-4 rounded-xl p-4"
                                  style={{ background: `${GREEN}0D`, border: `1px solid ${GREEN}40` }}>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#0D3B2E] dark:text-white/60"
                                    style={{ fontFamily: "Montserrat, sans-serif" }}>
                                    Hiring Details
                                  </p>
                                  <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold mb-1.5">
                                      <HelpCircle className="w-4 h-4" style={{ color: GREEN }} /> What kind of help do you need?
                                    </label>
                                    <Input placeholder="e.g. Plumber, Virtual Assistant, Designer" className="h-11 rounded-xl" {...form.register("helpNeeded")} />
                                  </div>
                                  <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold mb-1.5">
                                      <Coins className="w-4 h-4" style={{ color: GREEN }} />
                                      Rough Budget Range
                                      <span className="text-slate-400 font-normal text-xs">(optional)</span>
                                    </label>
                                    <Input placeholder="e.g. &#x20A6;5,000 - &#x20A6;20,000 / month" className="h-11 rounded-xl" {...form.register("budget")} />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="pt-1 space-y-3">
                              <button type="submit" disabled={isSaving}
                                className="w-full py-4 text-base font-black rounded-2xl text-white transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{ ...primaryBtn }}>
                                {isSaving ? "Saving..." : "Claim My Spot"}
                              </button>
                              {saveError && (
                                <p className="text-center text-xs font-semibold text-red-500">{saveError}</p>
                              )}
                              <div className="flex items-start justify-center gap-2 text-xs text-slate-400 text-center">
                                <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <p>Your details are only used to notify you about early access and launch news.</p>
                              </div>
                            </div>
                          </form>
                        </Form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── WHY BUKIEBRAIN ──────────────────────────────── */}
        <section className="py-20 px-5 md:px-10 bg-[#F0F5F2] dark:bg-[#0B1D3D]">
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center mb-12">
              <Tag>Why BukieBrain</Tag>
              <SectionH2>Designed for Excellence</SectionH2>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: <BadgeCheck    className="w-6 h-6" style={{ color: GREEN }} />, title: "First Access. Every Time.",  desc: "Waitlist members get matched with clients and workers before the platform opens publicly." },
                { icon: <Smartphone    className="w-6 h-6" style={{ color: GREEN }} />, title: "Built for Nigerian Data",     desc: "Chat-first design works on any network and any smartphone, even on slow connections." },
                { icon: <Globe         className="w-6 h-6" style={{ color: GREEN }} />, title: "Local & Remote Work",         desc: "Find gigs around the corner or take on international freelance projects worldwide." },
                { icon: <GraduationCap className="w-6 h-6" style={{ color: GREEN }} />, title: "Bite-Sized Learning",         desc: "Level up your skills with short, low-data courses right inside the app." },
                { icon: <UserCircle    className="w-6 h-6" style={{ color: GREEN }} />, title: "Verified Trust",              desc: "Every worker builds a BukiePassport, a verified track record clients can rely on." },
                { icon: <Briefcase     className="w-6 h-6" style={{ color: GREEN }} />, title: "Hire in Minutes",             desc: "Chat directly with verified talent. Post a job, get matched, and hire fast." },
              ].map((item, i) => (
                <Reveal key={item.title} delay={(i % 3) * 0.08 + Math.floor(i / 3) * 0.04}>
                  <FeatureCard {...item} />
                </Reveal>
              ))}
            </div>
            <Reveal className="text-center mt-12" delay={0.1}>
              <p className="text-sm italic text-slate-500 dark:text-slate-400">
                Built for workers, freelancers, and clients who value quality and speed.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── TESTIMONIALS ────────────────────────────────── */}
        <section className="py-20 px-5 md:px-10 bg-[#F7F9FF] dark:bg-[#071527]">
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center mb-12">
              <Tag>Testimonials</Tag>
              <SectionH2>What People Are Saying</SectionH2>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.1}>
                  <div className="h-full bg-white dark:bg-[#102348] border border-black/[0.05] dark:border-white/[0.08] rounded-[20px] p-7 flex flex-col hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
                    <div className="flex gap-0.5 mb-3">
                      {Array(5).fill(0).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic flex-1 mb-5">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <img src={t.avatar} alt="" loading="lazy"
                        className="w-10 h-10 rounded-full object-cover border-2 border-black/[0.05] dark:border-white/10" />
                      <div>
                        <h4 className="font-bold text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>{t.name}</h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{t.role}</span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────── */}
        <section id="faq" className="py-14 px-5 md:px-10 bg-[#F0F5F2] dark:bg-[#0B1D3D]">
          <div className="max-w-2xl mx-auto">
            <Reveal className="text-center mb-12">
              <Tag>FAQ</Tag>
              <SectionH2>Frequently Asked Questions</SectionH2>
            </Reveal>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <Reveal key={i} delay={i * 0.04}>
                  <div className="bg-white dark:bg-[#071527] border border-black/[0.05] dark:border-white/[0.08] rounded-[16px] overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full px-5 py-[18px] flex justify-between items-center gap-3 text-left font-bold text-sm hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                      aria-expanded={openFaq === i}>
                      {faq.q}
                      <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.28 }}>
                        <ChevronDown className="w-5 h-5 flex-shrink-0 text-slate-400" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                          style={{ overflow: "hidden" }}>
                          <p className="px-5 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ───────────────────────────────────── */}
        <section className="relative overflow-hidden py-24 px-5 text-center bg-[#F0F5F2] dark:bg-[#071C4D]">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 100%, ${GREEN}18 0%, transparent 70%)` }} />
          <div className="relative max-w-xl mx-auto">
            <Reveal>
              <h2 className="font-black text-[#0B1D3D] dark:text-white leading-[1.15] tracking-tight mb-4"
                style={{ fontFamily: "Montserrat, sans-serif", fontSize: "clamp(28px,5vw,44px)" }}>
                Your spot is waiting.<br />
                <span style={{ color: GREEN }}>Claim it Now!</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-[#0B1D3D]/70 dark:text-white/70 text-base mb-8">
                <CountUp to={4300} suffix="+" duration={1600} /> Nigerians have already secured founding member access and exclusive launch benefits.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <button onClick={() => scrollTo("join-section")}
                className="px-12 py-5 font-black text-[15px] text-white rounded-2xl transition-all hover:-translate-y-1 hover:brightness-105"
                style={{ ...primaryBtn, fontFamily: "Montserrat, sans-serif" }}>
                Claim My Spot
              </button>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="pt-14 pb-10 px-5 text-center text-[#0B1D3D] dark:text-white bg-[#E8EDF5] dark:bg-[#040e1e] transition-colors duration-300"
        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center mb-6">
            <Logo height="h-7" />
          </div>
          <div className="flex justify-center gap-3 mb-6">
            {[
              { label: "Instagram", d: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></> },
              { label: "Twitter/X", d: <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/> },
              { label: "Facebook",  d: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/> },
            ].map(s => (
              <a key={s.label} href="#" aria-label={s.label}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 border border-black/10 dark:border-white/10 text-black/45 dark:text-white/45 hover:text-[#0B1D3D] dark:hover:text-white hover:border-black/30 dark:hover:border-white/30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  {s.d}
                </svg>
              </a>
            ))}
          </div>
          <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mb-5">
            {[{ label: "Home", href: "#" }, { label: "FAQ", href: "#faq" }, { label: "Privacy", href: "#" }, { label: "Terms", href: "#" }, { label: "Contact", href: "#" }].map(l => (
              <a key={l.label} href={l.href}
                className="text-sm font-medium transition-colors text-[#0B1D3D]/50 dark:text-white/50 hover:text-[#0B1D3D] dark:hover:text-white">
                {l.label}
              </a>
            ))}
          </div>
          <p className="text-[10px] font-medium mb-2 text-[#0B1D3D]/55 dark:text-white/55"
            style={{ fontFamily: "Montserrat, sans-serif", letterSpacing: "0.04em" }}>
            BukieBrain is powered by Bukie Digital Solutions
          </p>
          <p className="text-[11px] uppercase tracking-widest text-[#0B1D3D]/45 dark:text-white/45">
            &copy; 2027 BukieBrain &middot; Chat-First Job Marketplace &middot; Quality Jobs &bull; Delivering Opportunity
          </p>
        </div>
      </footer>

      {/* ── BENEFITS OVERLAY ────────────────────────────── */}
      <AnimatePresence>
        {overlayOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-[200] flex items-end justify-center"
            style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(14px)" }}
            onClick={() => setOverlayOpen(false)}>
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-[500px] rounded-[32px_32px_0_0] px-6 pt-10 pb-16 max-h-[88vh] overflow-y-auto"
              style={{ background: "#061229", borderTop: "1px solid rgba(255,255,255,0.10)" }}>
              <button onClick={() => setOverlayOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-white text-xl transition-colors hover:brightness-125"
                style={{ background: "rgba(255,255,255,0.06)", lineHeight: 1 }}>
                &times;
              </button>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-xl"
                  style={{ background: GREEN }}>&#128142;</div>
                <h3 className="font-black text-xl text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Waitlist Benefits
                </h3>
              </div>
              <div className="space-y-5">
                {ALL_BENEFITS.map((b, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${NAVY}40` }}>{b.icon}</div>
                    <div>
                      <h4 className="font-bold text-sm text-white mb-0.5">{b.title}</h4>
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.60)" }}>{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => { setOverlayOpen(false); scrollTo("join-section"); }}
                className="w-full mt-10 py-4 font-black text-[14px] text-white rounded-[16px] transition-all hover:-translate-y-0.5 hover:brightness-105"
                style={{ fontFamily: "Montserrat, sans-serif", background: GREEN, boxShadow: `0 10px 30px ${GREEN}47` }}>
                Claim My Spot
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOAST ───────────────────────────────────────── */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{ y: 100,    opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] font-bold text-sm px-7 py-3.5 rounded-full whitespace-nowrap text-white"
            style={{ background: NAVY, boxShadow: "0 10px 40px rgba(0,0,0,0.30)" }}>
            &#10003; {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── COOKIE CONSENT ──────────────────────────────── */}
      <AnimatePresence>
        {cookieConsent === null && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{ y: 120,    opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32, delay: 1.2 }}
            className="fixed bottom-0 inset-x-0 z-[999] px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-none">
            <div
              className="max-w-2xl mx-auto rounded-[20px] p-5 sm:p-6 pointer-events-auto border border-black/[0.08] dark:border-white/[0.10]"
              style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[13px] text-[#0B1D3D] mb-1"
                    style={{ fontFamily: "Montserrat, sans-serif" }}>
                    We use cookies 🍪
                  </p>
                  <p className="text-[12px] text-slate-500 leading-relaxed">
                    BukieBrain uses essential cookies to keep the site working and remember your preferences. We do not sell or share your data. By continuing, you agree to our use of cookies in line with Nigeria's NDPR.
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => acceptCookies("declined")}
                    className="px-4 py-2 rounded-full text-[12px] font-semibold text-slate-500 border border-slate-200 hover:border-slate-300 transition-colors"
                    style={{ fontFamily: "Montserrat, sans-serif" }}>
                    Decline
                  </button>
                  <button
                    onClick={() => acceptCookies("accepted")}
                    className="px-5 py-2 rounded-full text-[12px] font-bold text-white transition-all hover:brightness-110"
                    style={{ background: GREEN, fontFamily: "Montserrat, sans-serif", boxShadow: `0 4px 14px ${GREEN}4D` }}>
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
