import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  BadgeCheck, Globe, Smartphone, UserCircle, Briefcase, Lock,
  CheckCircle, GraduationCap, MapPin, Link as LinkIcon,
  HelpCircle, Coins, ChevronDown, Sun, Moon, Star,
} from "lucide-react";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/supabase";
import logoSrc from "@/bukiebrain-logo.png";
import avatarMale1 from "@/avatar-male1.jpg";
import avatarMale2 from "@/avatar-male2.jpg";
import avatarFemale from "@/avatar-female.jpg";

const GREEN      = "#00D37F";
const GREEN_DARK = "#00bf72";

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

function Reveal({ children, delay = 0, className = "", id }: {
  children: React.ReactNode; delay?: number; className?: string; id?: string;
}) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });
  return (
    <motion.div ref={ref} id={id} className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function Logo({ height = "h-7" }: { height?: string }) {
  return (
    <span className="inline-flex items-center bg-white rounded-lg px-2 py-0.5">
      <img src={logoSrc} alt="BukieBrain" className={`${height} w-auto object-contain`} />
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="block font-bold uppercase tracking-[0.2em] text-[10px] mb-3"
      style={{ fontFamily: "Montserrat, sans-serif", color: GREEN }}>
      {children}
    </span>
  );
}

function SectionH2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`font-black tracking-tight text-[#0A142F] dark:text-white ${className}`}
      style={{ fontFamily: "Montserrat, sans-serif", fontSize: "clamp(26px,4vw,36px)" }}>
      {children}
    </h2>
  );
}

function CdBlock({ val, label }: { val: string; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-[14px] px-4 sm:px-5 py-3 min-w-[58px] sm:min-w-[68px]"
      style={{ background: "rgba(18,57,230,0.12)", border: "1px solid rgba(129,140,248,0.25)" }}>
      <span className="text-[#0A142F] dark:text-white leading-none"
        style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(20px,4.5vw,30px)", letterSpacing: "-0.02em" }}>
        {val}
      </span>
      <span className="mt-1 uppercase"
        style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: "0.15em", color: "rgba(129,140,248,0.70)" }}>
        {label}
      </span>
    </div>
  );
}

function StepCard({ icon, num, title, desc }: { icon: string; num: string; title: string; desc: string }) {
  return (
    <div className="bg-white dark:bg-[#0a1836] border border-black/[0.05] dark:border-white/[0.08] rounded-[20px] p-6 flex gap-4 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
      <div className="w-12 h-12 rounded-[12px] flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: `${GREEN}1A` }}>{icon}</div>
      <div>
        <span className="font-black text-[10px] tracking-widest"
          style={{ fontFamily: "Montserrat, sans-serif", color: GREEN }}>{num}</span>
        <h4 className="font-bold text-[15px] mt-0.5 mb-1"
          style={{ fontFamily: "Montserrat, sans-serif" }}>{title}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white dark:bg-[#0a1836]/80 border border-black/[0.05] dark:border-white/[0.08] rounded-[20px] p-6 flex gap-4 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-[#00D37F]/30 transition-all duration-300">
      <div className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0"
        style={{ background: `${GREEN}1A` }}>{icon}</div>
      <div>
        <h4 className="font-bold text-[15px] mb-1"
          style={{ fontFamily: "Montserrat, sans-serif" }}>{title}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function WaitlistPage() {
  const [submitted,       setSubmitted]       = useState(false);
  const [submittedRole,   setSubmittedRole]   = useState<RoleValue>("local_worker");
  const [overlayOpen,     setOverlayOpen]     = useState(false);
  const [toastVisible,    setToastVisible]    = useState(false);
  const [openFaq,         setOpenFaq]         = useState<number | null>(null);
  const [heroEmail,       setHeroEmail]       = useState("");
  const [heroError,       setHeroError]       = useState(false);
  const [isDark,          setIsDark]          = useState(false);
  const [selectedCities,  setSelectedCities]  = useState<string[]>([]);
  const [isSaving,        setIsSaving]        = useState(false);
  const [saveError,       setSaveError]       = useState<string | null>(null);

  const toggleCity = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const navVisible = useHideOnScroll();
  const countdown  = useCountdown(LAUNCH_DATE);
  const { display: badge, blink } = useTypewriter("LAUNCHING ACROSS NIGERIA SOON");

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

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOverlayOpen(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => {
    document.body.style.overflow = overlayOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [overlayOpen]);

  const scrollTo  = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const showToast = () => { setToastVisible(true); setTimeout(() => setToastVisible(false), 4000); };

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
    const { error } = await supabase.from("waitlist").insert({
      full_name:        v.fullName,
      phone:            v.phone,
      email:            v.email,
      location:         v.location,
      role:             v.role,
      preferred_cities: selectedCities,
      trade:            v.trade || undefined,
      service_area:     v.serviceArea || undefined,
      specialty:        v.specialty || undefined,
      portfolio:        v.portfolio || undefined,
      help_needed:      v.helpNeeded || undefined,
      budget:           v.budget || undefined,
    });
    setIsSaving(false);
    if (error) {
      setSaveError("Something went wrong saving your entry. Please try again.");
      return;
    }
    setSubmittedRole(v.role);
    setSubmitted(true);
    showToast();
  }

  const greenBtn = {
    background:  GREEN,
    boxShadow:   `0 10px 30px ${GREEN}4D`,
    fontFamily:  "Montserrat, sans-serif",
  };

  return (
    <div className="min-h-screen bg-[#F7F9FF] dark:bg-[#060f2a] text-[#0A142F] dark:text-white overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* NAV */}
      <motion.nav
        className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] dark:border-white/10 bg-white/95 dark:bg-[#060f2a]/95 backdrop-blur-md transition-colors duration-300"
        animate={{ y: navVisible ? 0 : "-100%" }}
        transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-10 h-[68px] flex items-center justify-between relative">
          <div className="flex flex-col gap-0.5">
            <Logo />
            <span className="text-[8px] font-bold tracking-[0.18em] uppercase text-[#0A142F]/60 dark:text-white/75"
              style={{ fontFamily: "Montserrat, sans-serif" }}>
              Chat-First Job Marketplace
            </span>
          </div>
          <span className="hidden md:block absolute left-1/2 -translate-x-1/2 text-[9px] font-medium text-[#0A142F]/30 dark:text-white/30 pointer-events-none whitespace-nowrap"
            style={{ fontFamily: "Montserrat, sans-serif", letterSpacing: "0.04em" }}>
            BukieBrain is powered by Bukie Digital Solutions
          </span>
          <div className="flex items-center gap-3">
            <a href="#join-section"
              className="hidden sm:block text-sm font-medium text-[#0A142F]/70 dark:text-white/70 hover:text-[#0A142F] dark:hover:text-white transition-colors">
              Join Waitlist
            </a>
            <button onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-[#0A142F] dark:text-white text-[11px] font-bold tracking-wide transition-colors hover:brightness-110"
              style={{ fontFamily: "Montserrat, sans-serif", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}>
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
            </button>
          </div>
        </div>
      </motion.nav>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden text-[#0A142F] dark:text-white pt-[92px] pb-12 bg-[#F7F9FF] dark:bg-[#060f2a] transition-colors duration-300">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% 10%, rgba(0,211,127,0.13) 0%, transparent 70%)" }} />

          <div className="relative max-w-3xl mx-auto px-5 md:px-10 flex flex-col items-center text-center gap-7">

            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-widest"
              style={{
                fontFamily: "Montserrat, sans-serif",
                background: "rgba(18,57,230,0.30)",
                border: "1px solid rgba(129,140,248,0.50)",
                boxShadow: "0 0 24px rgba(0,211,127,0.18)",
              }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: GREEN, boxShadow: `0 0 6px ${GREEN}` }} />
              <span style={{ minWidth: 230 }}>{badge}</span>
              <span className="inline-block w-0.5 h-3.5 rounded-sm align-middle"
                style={{ background: GREEN, opacity: blink ? 1 : 0 }} />
            </motion.div>

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
                    <span className="text-2xl font-black mb-3 flex-shrink-0"
                      style={{ fontFamily: "Montserrat, sans-serif", color: "rgba(129,140,248,0.35)" }}>
                      :
                    </span>
                  )}
                </div>
              ))}
            </div>

            <h1 className="font-black leading-[1.1] tracking-tight"
              style={{ fontFamily: "Montserrat, sans-serif", fontSize: "clamp(30px,6.5vw,56px)" }}>
              Nigeria&apos;s{" "}
              <span style={{ color: GREEN }}>Chat-First</span>
              {" "}Job Marketplace
            </h1>

            <p className="text-[#0A142F]/70 dark:text-white/70 text-base sm:text-lg max-w-xl leading-relaxed -mt-2">
              BukieBrain connects workers, freelancers, and clients through simple chat.
              No heavy apps, no heavy data, built for every Nigerian.
            </p>

            <form onSubmit={submitHeroEmail} className="flex gap-2 w-full max-w-[420px]">
              <input
                type="email"
                value={heroEmail}
                onChange={e => setHeroEmail(e.target.value)}
                placeholder="your@email.com"
                className={`flex-1 px-4 py-3.5 rounded-[14px] text-[#0A142F] dark:text-white text-sm outline-none transition-all ${heroError ? "animate-shake" : ""}`}
                style={{
                  background: "white",
                  border: `1.5px solid ${heroError ? GREEN : "rgba(0,0,0,0.20)"}`,
                }}
                onFocus={e => e.currentTarget.style.border = `1.5px solid ${GREEN}`}
                onBlur={e => e.currentTarget.style.border = `1.5px solid ${heroError ? GREEN : "rgba(0,0,0,0.20)"}`}
              />
              <button type="submit"
                className="px-5 py-3.5 rounded-[14px] font-black text-[13px] tracking-wide text-white whitespace-nowrap transition-all hover:-translate-y-0.5 hover:brightness-105"
                style={{ fontFamily: "Montserrat, sans-serif", background: GREEN, boxShadow: `0 8px 24px ${GREEN}59` }}>
                NOTIFY ME
              </button>
            </form>
            <p className="text-[#0A142F]/40 dark:text-white/40 text-[11px] font-semibold -mt-3">
              <span style={{ color: GREEN }}>100+</span> founding slots still available
            </p>

            <div className="w-full max-w-[400px] text-left rounded-3xl p-6"
              style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(0,211,127,0.18)", backdropFilter: "blur(12px)" }}>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ fontFamily: "Montserrat, sans-serif", color: GREEN }}>
                Waitlist Members Get
              </p>
              <div className="space-y-3">
                {ALL_BENEFITS.slice(0, 4).map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-lg leading-none mt-0.5">{b.icon}</span>
                    <div>
                      <span className="font-bold text-[13px] text-[#0A142F]">{b.title}</span>
                      <p className="text-[11px] text-[#0A142F]/60 mt-0.5 leading-snug">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setOverlayOpen(true)}
                className="mt-5 text-[11px] font-bold tracking-wide flex items-center gap-1 hover:brightness-90 transition"
                style={{ color: GREEN, fontFamily: "Montserrat, sans-serif" }}>
                See all {ALL_BENEFITS.length} benefits →
              </button>
            </div>

            <div className="flex -space-x-3 items-center">
              {[avatarMale1, avatarMale2, avatarFemale].map((src, i) => (
                <img key={i} src={src} alt="member"
                  className="w-9 h-9 rounded-full border-2 border-white object-cover" />
              ))}
              <div className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white"
                style={{ background: "rgba(18,57,230,0.70)", fontFamily: "Montserrat, sans-serif" }}>
                +99
              </div>
            </div>
            <p className="text-[11px] font-semibold text-[#0A142F]/50 dark:text-white/50 -mt-5">
              Joined so far — be part of the founding wave
            </p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo("join-section")}
              className="px-8 py-4 rounded-[16px] font-black text-[15px] tracking-wide text-white transition-all hover:-translate-y-0.5 hover:brightness-105"
              style={greenBtn}>
              Claim My Early Access Spot →
            </motion.button>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <Reveal className="max-w-6xl mx-auto px-5 md:px-10 py-20">
          <div className="text-center mb-12">
            <Tag>How It Works</Tag>
            <SectionH2>Three Steps to Your First Job</SectionH2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StepCard icon="📝" num="STEP 01" title="Join the Waitlist" desc="Fill in your details and claim your early-access spot in under 2 minutes." />
            <StepCard icon="🔔" num="STEP 02" title="Get Early Access" desc="Receive your 48-hour head start before the public launch on 20 Jan 2027." />
            <StepCard icon="💼" num="STEP 03" title="Start Working" desc="Match with clients or workers via simple chat. Get paid securely." />
          </div>
        </Reveal>

        {/* FEATURES */}
        <section className="bg-[#F0F4FF] dark:bg-[#07112e] py-20 transition-colors duration-300">
          <Reveal className="max-w-6xl mx-auto px-5 md:px-10">
            <div className="text-center mb-12">
              <Tag>Platform Features</Tag>
              <SectionH2>Built for Every Nigerian</SectionH2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard icon={<Smartphone className="w-6 h-6" style={{ color: GREEN }} />} title="Chat-First Design" desc="Get hired through simple WhatsApp-style chat. No heavy apps or complex portals." />
              <FeatureCard icon={<BadgeCheck className="w-6 h-6" style={{ color: GREEN }} />} title="BukiePassport™" desc="Your verified identity badge that builds instant trust with every client or worker." />
              <FeatureCard icon={<Globe className="w-6 h-6" style={{ color: GREEN }} />} title="Local & Global" desc="Find work in your neighbourhood or take on remote gigs for international clients." />
              <FeatureCard icon={<Lock className="w-6 h-6" style={{ color: GREEN }} />} title="Secure Payments" desc="Every transaction is protected. You always get paid for the work you do." />
              <FeatureCard icon={<GraduationCap className="w-6 h-6" style={{ color: GREEN }} />} title="Skill Academy" desc="Bite-sized, low-data courses to help you level up and earn more per gig." />
              <FeatureCard icon={<UserCircle className="w-6 h-6" style={{ color: GREEN }} />} title="Smart Matching" desc="Our algorithm surfaces the most relevant jobs and talent for you automatically." />
            </div>
          </Reveal>
        </section>

        {/* TESTIMONIALS */}
        <Reveal className="max-w-6xl mx-auto px-5 md:px-10 py-20">
          <div className="text-center mb-12">
            <Tag>Beta Feedback</Tag>
            <SectionH2>What Early Users Say</SectionH2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white dark:bg-[#0a1836] border border-black/[0.05] dark:border-white/[0.08] rounded-[24px] p-7 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" style={{ color: GREEN }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-[#0A142F]/80 dark:text-white/80 flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-[13px]">{t.name}</p>
                    <p className="text-[11px] text-[#0A142F]/50 dark:text-white/50">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* JOIN FORM */}
        <section id="join-section" className="bg-[#F0F4FF] dark:bg-[#07112e] py-20 transition-colors duration-300">
          <Reveal className="max-w-xl mx-auto px-5 md:px-10">
            <div className="text-center mb-10">
              <Tag>Reserve Your Spot</Tag>
              <SectionH2 className="mb-3">Join the Waitlist</SectionH2>
              <p className="text-[#0A142F]/60 dark:text-white/60 text-sm">
                {submitted
                  ? "You're on the list! We'll notify you 48 hours before launch."
                  : "Tell us about yourself and we'll make sure your experience is tailored from day one."}
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={springBounce}
                className="bg-white dark:bg-[#0a1836] rounded-[28px] p-10 text-center border border-black/[0.05] dark:border-white/[0.08]">
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl"
                  style={{ background: `${GREEN}1A` }}>🎉</div>
                <h3 className="font-black text-2xl mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  You&apos;re In!
                </h3>
                <p className="text-[#0A142F]/60 dark:text-white/60 text-sm mb-2">
                  Welcome to BukieBrain, {ROLE_LABELS[submittedRole]}.
                </p>
                <p className="text-[#0A142F]/60 dark:text-white/60 text-sm">
                  We&apos;ll notify you 48 hours before the public launch on 20 Jan 2027.
                </p>
                <div className="mt-8 flex items-center justify-center gap-2 text-sm font-bold"
                  style={{ color: GREEN }}>
                  <CheckCircle className="w-5 h-5" />
                  Founding Member Status Secured
                </div>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-[#0a1836] rounded-[28px] p-8 border border-black/[0.05] dark:border-white/[0.08]">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                    {/* Role selector */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-3"
                        style={{ fontFamily: "Montserrat, sans-serif", color: GREEN }}>
                        I want to…
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {ROLES.map(r => (
                          <button key={r.value} type="button"
                            onClick={() => form.setValue("role", r.value)}
                            className="py-3 px-2 rounded-[14px] text-xs font-bold text-center transition-all border"
                            style={{
                              fontFamily: "Montserrat, sans-serif",
                              background: selectedRole === r.value ? GREEN : "transparent",
                              color: selectedRole === r.value ? "white" : undefined,
                              borderColor: selectedRole === r.value ? GREEN : "rgba(0,0,0,0.10)",
                            }}>
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest"
                            style={{ fontFamily: "Montserrat, sans-serif" }}>Full Name</FormLabel>
                          <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest"
                            style={{ fontFamily: "Montserrat, sans-serif" }}>Phone Number</FormLabel>
                          <FormControl><Input placeholder="+234 800 000 0000" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest"
                          style={{ fontFamily: "Montserrat, sans-serif" }}>Email Address</FormLabel>
                        <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest"
                          style={{ fontFamily: "Montserrat, sans-serif" }}>State / City</FormLabel>
                        <FormControl><Input placeholder="e.g. Lagos, Abuja" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Preferred cities */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-3"
                        style={{ fontFamily: "Montserrat, sans-serif" }}>
                        Preferred Cities (optional)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {NG_CITIES.map(city => (
                          <button key={city} type="button"
                            onClick={() => toggleCity(city)}
                            className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border"
                            style={{
                              fontFamily: "Montserrat, sans-serif",
                              background: selectedCities.includes(city) ? GREEN : "transparent",
                              color: selectedCities.includes(city) ? "white" : undefined,
                              borderColor: selectedCities.includes(city) ? GREEN : "rgba(0,0,0,0.10)",
                            }}>
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Role-specific fields */}
                    {selectedRole === "local_worker" && (
                      <FormField control={form.control} name="trade" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest"
                            style={{ fontFamily: "Montserrat, sans-serif" }}>
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5" style={{ color: GREEN }} /> Your Trade / Skill
                            </span>
                          </FormLabel>
                          <FormControl><Input placeholder="e.g. Plumber, Cook, Driver" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}

                    {selectedRole === "remote_freelancer" && (
                      <>
                        <FormField control={form.control} name="specialty" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest"
                              style={{ fontFamily: "Montserrat, sans-serif" }}>
                              <span className="flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5" style={{ color: GREEN }} /> Freelance Specialty
                              </span>
                            </FormLabel>
                            <FormControl><Input placeholder="e.g. Graphic Design, Copywriting" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="portfolio" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest"
                              style={{ fontFamily: "Montserrat, sans-serif" }}>
                              <span className="flex items-center gap-1.5">
                                <LinkIcon className="w-3.5 h-3.5" style={{ color: GREEN }} /> Portfolio URL (optional)
                              </span>
                            </FormLabel>
                            <FormControl><Input placeholder="https://yourportfolio.com" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </>
                    )}

                    {selectedRole === "hire_talent" && (
                      <>
                        <FormField control={form.control} name="helpNeeded" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest"
                              style={{ fontFamily: "Montserrat, sans-serif" }}>
                              <span className="flex items-center gap-1.5">
                                <HelpCircle className="w-3.5 h-3.5" style={{ color: GREEN }} /> What do you need help with?
                              </span>
                            </FormLabel>
                            <FormControl><Input placeholder="e.g. Website design, Event catering" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="budget" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest"
                              style={{ fontFamily: "Montserrat, sans-serif" }}>
                              <span className="flex items-center gap-1.5">
                                <Coins className="w-3.5 h-3.5" style={{ color: GREEN }} /> Budget Range (optional)
                              </span>
                            </FormLabel>
                            <FormControl><Input placeholder="e.g. ₦20,000 – ₦50,000" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </>
                    )}

                    {saveError && (
                      <p className="text-red-500 text-sm font-medium">{saveError}</p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={isSaving}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-4 rounded-[16px] font-black text-[15px] tracking-wide text-white transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-60"
                      style={greenBtn}>
                      {isSaving ? "Saving…" : "Join the Waitlist →"}
                    </motion.button>

                    <p className="text-center text-[10px] text-[#0A142F]/40 dark:text-white/40">
                      <Lock className="w-3 h-3 inline mr-1" />
                      Your data is safe. We never sell or share your information.
                    </p>
                  </form>
                </Form>
              </div>
            )}
          </Reveal>
        </section>

        {/* FAQ */}
        <Reveal id="faq" className="max-w-2xl mx-auto px-5 md:px-10 py-20">
          <div className="text-center mb-12">
            <Tag>FAQ</Tag>
            <SectionH2>Common Questions</SectionH2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i}
                className="bg-white dark:bg-[#0a1836] border border-black/[0.05] dark:border-white/[0.08] rounded-[18px] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left font-bold text-[14px] hover:brightness-95 transition-all"
                  style={{ fontFamily: "Montserrat, sans-serif" }}>
                  <span>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform"
                    style={{ transform: openFaq === i ? "rotate(180deg)" : "none", color: GREEN }} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm text-[#0A142F]/65 dark:text-white/65 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </Reveal>

        {/* CTA BANNER */}
        <Reveal className="max-w-6xl mx-auto px-5 md:px-10 pb-20">
          <div className="rounded-[32px] px-8 py-14 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0D1F6B 0%, #0a142F 100%)" }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 70% 70% at 50% 0%, rgba(0,211,127,0.18) 0%, transparent 70%)" }} />
            <div className="relative">
              <Tag>Limited Spots</Tag>
              <h2 className="font-black text-white mb-4"
                style={{ fontFamily: "Montserrat, sans-serif", fontSize: "clamp(24px,4vw,36px)" }}>
                Don&apos;t Miss Your<br />Founding Member Spot
              </h2>
              <p className="text-white/65 text-sm mb-8 max-w-md mx-auto">
                Join hundreds of Nigerians already on the waitlist. Be first to access the platform that&apos;s changing how Nigeria works.
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => scrollTo("join-section")}
                className="px-8 py-4 rounded-[16px] font-black text-[15px] tracking-wide text-white transition-all hover:-translate-y-0.5 hover:brightness-105"
                style={greenBtn}>
                Claim My Spot Now →
              </motion.button>
            </div>
          </div>
        </Reveal>
      </main>

      {/* FOOTER */}
      <footer className="text-center py-10 px-5"
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
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 border border-black/10 dark:border-white/10 text-black/45 dark:text-white/45 hover:text-[#0A142F] dark:hover:text-white hover:border-black/30 dark:hover:border-white/30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  {s.d}
                </svg>
              </a>
            ))}
          </div>
          <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mb-5">
            {[{ label: "Home", href: "#" }, { label: "FAQ", href: "#faq" }, { label: "Privacy", href: "#" }, { label: "Terms", href: "#" }, { label: "Contact", href: "#" }].map(l => (
              <a key={l.label} href={l.href}
                className="text-sm font-medium transition-colors text-[#0A142F]/50 dark:text-white/50 hover:text-[#0A142F] dark:hover:text-white">
                {l.label}
              </a>
            ))}
          </div>
          <p className="text-[10px] font-medium mb-2 text-[#0A142F]/55 dark:text-white/55"
            style={{ fontFamily: "Montserrat, sans-serif", letterSpacing: "0.04em" }}>
            BukieBrain is powered by Bukie Digital Solutions
          </p>
          <p className="text-[11px] uppercase tracking-widest text-[#0A142F]/45 dark:text-white/45">
            © 2027 BukieBrain · Chat-First Job Marketplace · Quality Jobs • Delivering Opportunity
          </p>
        </div>
      </footer>

      {/* BENEFITS OVERLAY */}
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
              style={{ background: "#0D152B", borderTop: "1px solid rgba(255,255,255,0.10)" }}>
              <button onClick={() => setOverlayOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-white text-xl transition-colors hover:brightness-125"
                style={{ background: "rgba(255,255,255,0.06)", lineHeight: 1 }}>
                ×
              </button>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-xl"
                  style={{ background: GREEN }}>💎</div>
                <h3 className="font-black text-xl text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Waitlist Benefits
                </h3>
              </div>
              <div className="space-y-5">
                {ALL_BENEFITS.map((b, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: "rgba(18,57,230,0.25)" }}>{b.icon}</div>
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

      {/* TOAST */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{ y: 100,    opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] font-bold text-sm px-7 py-3.5 rounded-full whitespace-nowrap text-white"
            style={{ background: GREEN, boxShadow: "0 10px 40px rgba(0,0,0,0.30)" }}>
            ✅ Successfully joined the waitlist!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
