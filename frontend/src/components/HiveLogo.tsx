export default function HiveLogo({
  size = 48,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <img
      src="/assets/images/ic_hive.png"
      alt="Hive Logo"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}
