export function TabLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#07080a] text-zinc-100 flex flex-col font-sans antialiased">
      {/* Header placeholder matching AppHeader height */}
      <div className="sticky top-0 z-40 h-14 border-b border-white/[0.08] bg-[#07080a]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="h-7 w-28 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="hidden md:flex items-center gap-2">
            <div className="h-7 w-24 rounded-lg bg-white/[0.05] animate-pulse" />
            <div className="h-7 w-28 rounded-lg bg-white/[0.05] animate-pulse" />
            <div className="h-7 w-28 rounded-lg bg-white/[0.05] animate-pulse" />
          </div>
        </div>
        <div className="h-8 w-36 rounded-xl bg-white/[0.06] animate-pulse" />
      </div>

      {/* Main content skeleton */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="h-20 rounded-2xl bg-[#0c0d12] border border-white/[0.08] animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-28 rounded-2xl bg-[#0c0d12] border border-white/[0.08] animate-pulse" />
          <div className="h-28 rounded-2xl bg-[#0c0d12] border border-white/[0.08] animate-pulse" />
          <div className="h-28 rounded-2xl bg-[#0c0d12] border border-white/[0.08] animate-pulse" />
        </div>
        <div className="h-72 rounded-2xl bg-[#0c0d12] border border-white/[0.08] animate-pulse" />
      </main>
    </div>
  );
}
