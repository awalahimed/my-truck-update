interface StatsCardsProps {
  pendingCount: number;
  totalCount: number;
  connected: boolean;
  formatNumber: (num: number) => string;
}

export function StatsCards({ pendingCount, totalCount, connected, formatNumber }: StatsCardsProps) {
  return (
    <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
      <div className="flex items-center gap-1.5 md:gap-2 px-1.5 md:px-2 py-1 md:py-1.5 rounded-md shadow-md backdrop-blur-sm bg-background/95 border text-xs md:text-sm">
        {/* Live Status */}
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className={`text-[10px] md:text-xs font-semibold ${connected ? 'text-green-600' : 'text-red-600'}`}>
            {connected ? 'Live' : 'Off'}
          </span>
        </div>

        <div className="w-px h-3 md:h-4 bg-border" />

        {/* Pending Approval */}
        <div className="flex items-center gap-1">
          <span className="text-[8px] md:text-[9px] text-muted-foreground uppercase tracking-wide font-medium hidden sm:inline">Pending</span>
          <span className="text-[8px] md:text-[9px] text-muted-foreground uppercase tracking-wide font-medium sm:hidden">P</span>
          <span className="text-xs md:text-sm font-bold text-yellow-600">{formatNumber(pendingCount)}</span>
        </div>

        <div className="w-px h-3 md:h-4 bg-border" />

        {/* Total Orders */}
        <div className="flex items-center gap-1">
          <span className="text-[8px] md:text-[9px] text-muted-foreground uppercase tracking-wide font-medium hidden sm:inline">Total</span>
          <span className="text-[8px] md:text-[9px] text-muted-foreground uppercase tracking-wide font-medium sm:hidden">T</span>
          <span className="text-xs md:text-sm font-bold text-blue-600">{formatNumber(totalCount)}</span>
        </div>
      </div>
    </div>
  );
}
