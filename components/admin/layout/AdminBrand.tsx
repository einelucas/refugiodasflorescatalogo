/// Logo da marca no painel (círculo roxo com a flor).
export function AdminLogo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#54205f] to-[#76367f] shadow-sm shadow-primary/20 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/imagens/logo-refugio.svg" alt="" className="h-full w-full" />
    </span>
  );
}

/// Faixa degradê no topo dos cabeçalhos do painel.
export function AdminAccentBar() {
  return <div className="h-[3px] bg-gradient-to-r from-[#54205f] via-[#76367f] to-[#d97ca8]" />;
}
