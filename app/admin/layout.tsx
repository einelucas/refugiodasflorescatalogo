import Link from "next/link";
import { Flower2, Package, FolderTree, FileText, Box } from "lucide-react";
import { Providers } from "@/components/Providers";
import { SairButton } from "@/components/admin/SairButton";

const NAV = [
  { href: "/admin/produtos", rotulo: "Produtos", Icone: Package },
  { href: "/admin/categorias", rotulo: "Categorias", Icone: FolderTree },
  { href: "/admin/paginas", rotulo: "Páginas", Icone: FileText },
  { href: "/admin/embalagens", rotulo: "Embalagens", Icone: Box },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-muted/30">
        <header className="border-b bg-background">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
            <Link href="/admin/produtos" className="flex items-center gap-2 font-serif text-lg">
              <Flower2 className="h-5 w-5 text-primary" />
              Refúgio
            </Link>
            <nav className="flex flex-1 gap-1">
              {NAV.map(({ href, rotulo, Icone }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Icone className="h-4 w-4" />
                  {rotulo}
                </Link>
              ))}
            </nav>
            <SairButton />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>
    </Providers>
  );
}
