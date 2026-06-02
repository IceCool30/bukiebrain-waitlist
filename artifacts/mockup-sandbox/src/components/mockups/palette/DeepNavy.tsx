export function DeepNavy() {
  return (
    <div className="min-h-[280px] flex flex-col items-center justify-center text-center p-6 gap-5 rounded-2xl bg-[#0B1221] text-white"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", width: 400 }}>
      <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
        style={{ background: "rgba(59,130,246,0.25)", border: "1px solid rgba(96,165,250,0.40)", fontFamily: "Montserrat, sans-serif" }}>
        <span className="w-2 h-2 rounded-full bg-[#60A5FA]" />
        <span>LAUNCHING ACROSS NIGERIA SOON</span>
      </div>
      <h1 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 28, fontWeight: 900, lineHeight: 1.1 }}>
        Nigeria's <span style={{ color: "#60A5FA" }}>Chat-First</span> Job Marketplace
      </h1>
      <p className="text-[13px] text-white/65 max-w-xs">
        BukieBrain connects workers, freelancers, and clients through simple chat.
      </p>
      <button className="px-6 py-3 rounded-[14px] font-black text-[13px] text-white"
        style={{ background: "#3B82F6", boxShadow: "0 8px 24px rgba(59,130,246,0.35)", fontFamily: "Montserrat, sans-serif" }}>
        Claim My Spot →
      </button>
    </div>
  );
}
