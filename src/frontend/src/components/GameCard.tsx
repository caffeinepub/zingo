interface GameCardProps {
  icon: string;
  title: string;
  subtitle?: string;
  onClick: () => void;
  "data-ocid": string;
  color?: string;
  wide?: boolean;
}

export function GameCard({
  icon,
  title,
  subtitle,
  onClick,
  "data-ocid": ocid,
  color = "#8B5CF6",
  wide = false,
}: GameCardProps) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className={`game-card bg-white rounded-[20px] shadow-card flex flex-col items-center justify-center p-4 gap-2 active:scale-95 transition-all w-full ${
        wide ? "flex-row justify-start px-5 py-4" : ""
      }`}
      style={{ minHeight: wide ? 72 : 110 }}
    >
      <div
        className="rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{
          width: wide ? 44 : 52,
          height: wide ? 44 : 52,
          background: `${color}18`,
        }}
      >
        {icon}
      </div>
      <div className={wide ? "text-left flex-1" : "text-center"}>
        <div className="text-sm font-bold text-foreground leading-tight">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
        )}
      </div>
      {wide && (
        <div className="flex-shrink-0 text-muted-foreground text-lg">›</div>
      )}
    </button>
  );
}
