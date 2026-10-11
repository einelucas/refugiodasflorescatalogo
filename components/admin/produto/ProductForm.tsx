"use client";

import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProductForm } from "@/hooks/admin/useProductForm";
import { useProductImages } from "@/hooks/admin/useProductImages";
import { useProductShippingTest } from "@/hooks/admin/useProductShippingTest";
import { campoInvalidaTesteFrete } from "@/lib/admin/produto/formulario";
import type { CategoriaOpcao, Embalagem, ProdutoForm } from "@/types";
import { ProductBasicInfoSection } from "./ProductBasicInfoSection";
import { ProductDimensionsSection } from "./ProductDimensionsSection";
import { ProductFormActions } from "./ProductFormActions";
import { ProductImagesSection } from "./ProductImagesSection";
import { ProductPackagingSection } from "./ProductPackagingSection";
import { ProductPublicationSection } from "./ProductPublicationSection";
import { ProductShippingTestSection } from "./ProductShippingTestSection";

type ProductFormProps = {
  categories: CategoriaOpcao[];
  packages: Embalagem[];
  initialProduct?: ProdutoForm;
};

export function ProductForm({ categories, packages, initialProduct }: ProductFormProps) {
  const form = useProductForm({
    categorias: categories,
    embalagens: packages,
    inicial: initialProduct,
  });
  const images = useProductImages({
    onAdd: form.adicionarImagem,
    onRemove: form.removerImagem,
  });
  const shippingTest = useProductShippingTest({
    produto: form.produto,
    onVerified: form.marcarMedidasVerificadas,
  });

  function changeField<K extends keyof ProdutoForm>(field: K, value: ProdutoForm[K]) {
    form.atualizarCampo(field, value);
    if (campoInvalidaTesteFrete(field)) shippingTest.invalidate();
  }

  function applyPackage(id: string) {
    if (form.aplicarEmbalagem(id)) shippingTest.invalidate();
  }

  return (
    <div className="space-y-6">
      {!form.produto.medidasVerificadas && form.produto.id && (
        <Alert variant="warning">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Medidas ainda não conferidas</AlertTitle>
          <AlertDescription>
            Peso e dimensões deste produto vieram do site antigo e são estimativas. Meça a caixa
            fechada, ajuste abaixo e use <strong>Testar frete</strong> para confirmar.
          </AlertDescription>
        </Alert>
      )}

      <ProductBasicInfoSection
        product={form.produto}
        categories={categories}
        onFieldChange={changeField}
      >
        <ProductImagesSection
          images={form.produto.imagens}
          productName={form.produto.nome}
          imageState={images}
        />
      </ProductBasicInfoSection>

      <ProductPackagingSection
        packages={packages}
        measurementsVerified={form.produto.medidasVerificadas}
        onApplyPackage={applyPackage}
      >
        <ProductDimensionsSection product={form.produto} onFieldChange={changeField} />
        <ProductShippingTestSection shippingTest={shippingTest} />
      </ProductPackagingSection>

      <ProductPublicationSection
        published={form.produto.ativo}
        onPublishedChange={(published) => changeField("ativo", published)}
      >
        <ProductFormActions
          saving={form.salvando}
          onCancel={form.cancelar}
          onSave={() => void form.salvar()}
        />
      </ProductPublicationSection>
    </div>
  );
}
