"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

type ProductPublicationSectionProps = {
  published: boolean;
  onPublishedChange: (published: boolean) => void;
  children?: ReactNode;
};

export function ProductPublicationSection({
  published,
  onPublishedChange,
  children,
}: ProductPublicationSectionProps) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
        <label className="flex items-start gap-3">
          <Switch checked={published} onCheckedChange={onPublishedChange} />
          <span className="text-sm">
            Publicado no site
            <span className="block text-xs text-muted-foreground">
              Deixe desligado enquanto estiver preenchendo.
            </span>
          </span>
        </label>
        {children}
      </CardContent>
    </Card>
  );
}
