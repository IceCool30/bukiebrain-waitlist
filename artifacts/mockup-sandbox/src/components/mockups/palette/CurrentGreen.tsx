export function CurrentGreen() {
  return (
    <div className="min-h-[280px] flex flex-col items-center justify-center text-center p-6 gap-5 rounded-2xl bg-[#F7F9FF] text-[#0A142F]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", width: 400 }}>
      <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
        style={{ background: "rgba(18,57,230,0.30)", border: "1px solid rgba(129,140,248,0.50)", fontFamily: "Montserrat, sans-serif" }}>
        <span className="w-2 h-2 rounded-full bg-[#00D37F]" />
        <span>LAUNCHING ACROSS NIGERIA SOON</span>
      </div>
      <h1 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 28, fontWeight: 900, lineHeight: 1.1 }}>
        Nigeria's <span style={{ color: "#00D37F" }}>Chat-First</span> Job Marketplace
      </h1>
      <p className="text-[13px] text-[#0A142F]/70 max-w-xs">
        BukieBrain connects workers, freelancers, and clients through simple chat.
      </p>
      <button className="px-6 py-3 rounded-[14px] font-black text-[13px] text-white"
        style={{ background: "#00D37F", boxShadow: "0 8px 24px rgba(0,211,127,0.35)", fontFamily: "Montserrat, sans-serif" }}>
        Claim My Spot →
      </button>
    </div>
  );
}
