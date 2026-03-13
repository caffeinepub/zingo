export function BannerAd() {
  return (
    <div
      data-ocid="home.ad_banner"
      className="w-full rounded-xl flex items-center justify-center py-3 px-4"
      style={{
        background: "#162233",
        boxShadow: "4px 4px 10px #070e17, -3px -3px 8px #203247",
        border: "1px solid rgba(0,229,255,0.08)",
      }}
    >
      <span
        className="text-xs font-medium tracking-wide uppercase"
        style={{ color: "#5a7490" }}
      >
        Advertisement
      </span>
    </div>
  );
}
