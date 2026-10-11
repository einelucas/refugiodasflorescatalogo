import assert from "node:assert/strict";
import { test } from "node:test";
import {
  productPackagingLabel,
  productPriceLabel,
  productThumbnailUrl,
  type AdminProductListItem,
} from "@/lib/admin/produtos/apresentacao";

const PRODUCT: AdminProductListItem = {
  id: "produto-1",
  nome: "Buquê",
  sobConsulta: false,
  preco: "149.90",
  ativo: true,
  alturaCm: "20.0",
  larguraCm: "30.0",
  comprimentoCm: "40.0",
  pesoKg: "1.250",
  categoria: { nome: "Buquês" },
  imagens: [{ url: "https://example.com/buque.webp" }],
};

test("preço mantém capitalização específica de mobile e desktop", () => {
  assert.match(productPriceLabel(PRODUCT), /149,90/);
  assert.equal(productPriceLabel({ ...PRODUCT, sobConsulta: true }), "a consultar");
  assert.equal(productPriceLabel({ ...PRODUCT, sobConsulta: true }, true), "A consultar");
});

test("embalagem mantém conversão numérica e formatação existente", () => {
  assert.equal(productPackagingLabel(PRODUCT), "20×30×40 cm · 1.25 kg");
});

test("miniatura usa a primeira imagem ou retorna ausência", () => {
  assert.equal(productThumbnailUrl(PRODUCT), "https://example.com/buque.webp");
  assert.equal(productThumbnailUrl({ ...PRODUCT, imagens: [] }), null);
});
