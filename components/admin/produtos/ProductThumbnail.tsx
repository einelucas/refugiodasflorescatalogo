import { cn } from "@/lib/utils";

export function ProductThumbnail({ url, compact = false }: { url: string | null; compact?: boolean }) {
  const className = compact
    ? "h-10 w-10 rounded border"
    : "h-16 w-16 shrink-0 rounded-md border";
  if (!url) return <div className={cn(className, "bg-muted")} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" loading="lazy" className={cn(className, "object-cover")} />
  );
}
