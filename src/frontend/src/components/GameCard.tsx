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
  wide = false,
}: GameCardProps) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className={`game-card rounded-[20px] flex items-center justify-center p-4 gap-2 w-full transition-all ${
        wide ? "flex-row justify-start px-5 py-4" : "flex-col"
      }`}
      style={{
        minHeight: wide ? 72 : 110,
        background: "#162233",
        boxShadow: "4px 4px 10px #070e17, -3px -3px 8px #203247",
      }}
    >
      {/* Icon circle — nm-pressed inset */}
      <div
        className="rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{
          width: wide ? 44 : 52,
          height: wide ? 44 : 52,
          background: "#0d1b2a",
          boxShadow: "inset 3px 3px 6px #070e17, inset -2px -2px 5px #1a2d42",
        }}
      >
        {icon}
      </div>

      <div className={wide ? "text-left flex-1" : "text-center"}>
        <div
          className="text-sm font-bold leading-tight"
          style={{ color: "#e2eaf4" }}
        >
          {title}
        </div>
        {subtitle && (
          <div className="text-xs mt-0.5" style={{ color: "#5a7490" }}>
            {subtitle}
          </div>
        )}
      </div>

      {wide && (
        <div className="flex-shrink-0 text-lg" style={{ color: "#5a7490" }}>
          ›
        </div>
      )}
    </button>
  );
}
