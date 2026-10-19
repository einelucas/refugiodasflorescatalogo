import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { despesaSchema, estoqueSchema, fichaSchema, producaoSchema, vendaSchema } from "./validacao";

export class GestaoErro extends Error { constructor(message: string, public status = 400) { super(message); } }

export async function salvarMateriaPrima(entrada: unknown, id?: string) {
  const dados = estoqueSchema.parse(entrada);
  return id
    ? db.materiaPrima.update({ where: { id }, data: dados })
    : db.materiaPrima.create({ data: dados });
}
export async function excluirMateriaPrima(id: string) {
  return db.materiaPrima.delete({ where: { id } });
}

export async function salvarFicha(entrada: unknown) {
  const { produtoId, ingredientes } = fichaSchema.parse(entrada);
  return db.$transaction(async tx => {
    const existe = await tx.produto.findUnique({ where: { id: produtoId }, select: { id: true } });
    if (!existe) throw new GestaoErro("Produto não encontrado.", 404);
    if (ingredientes.length) {
      const existentes = await tx.materiaPrima.count({ where: { id: { in: ingredientes.map(i => i.materiaPrimaId) } } });
      if (existentes !== ingredientes.length) throw new GestaoErro("Matéria-prima não encontrada.");
    }
    await tx.fichaTecnica.deleteMany({ where: { produtoId } });
    for (const ing of ingredientes) await tx.fichaTecnica.create({ data: { produtoId, ...ing } });
  });
}

// Decremento condicional no banco evita saldo negativo mesmo em requisições simultâneas.
// Transação atômica: falhas revertem todos os consumos e o lançamento.
async function consumirFicha(tx: Prisma.TransactionClient, produtoId: string, quantidade: number) {
  const ficha = await tx.fichaTecnica.findMany({ where: { produtoId }, include: { materiaPrima: true } });
  if (!ficha.length) throw new GestaoErro("Cadastre a ficha técnica antes de movimentar o produto.");
  for (const item of ficha) {
    const necessario = new Prisma.Decimal(item.quantidade).mul(quantidade);
    const updated = await tx.materiaPrima.updateMany({
      where: { id: item.materiaPrimaId, quantidade: { gte: necessario } },
      data: { quantidade: { decrement: necessario } },
    });
    if (updated.count !== 1) throw new GestaoErro("Estoque insuficiente: " + item.materiaPrima.nome);
  }
}
export async function registrarProducao(entrada: unknown) {
  const { produtoId, quantidade } = producaoSchema.parse(entrada);
  return db.$transaction(async tx => {
    const produto = await tx.produto.findUnique({ where: { id: produtoId } });
    if (!produto) throw new GestaoErro("Produto não encontrado.", 404);
    await consumirFicha(tx, produtoId, quantidade);
    return tx.producao.create({ data: { produtoId, quantidade, nomeProduto: produto.nome } });
  });
}
export async function registrarVenda(entrada: unknown) {
  const { produtoId, quantidade, cliente } = vendaSchema.parse(entrada);
  return db.$transaction(async tx => {
    const produto = await tx.produto.findUnique({ where: { id: produtoId } });
    if (!produto) throw new GestaoErro("Produto não encontrado.", 404);
    if (produto.preco === null) throw new GestaoErro("Produto sem preço cadastrado.");
    // A venda registra receita; produção é a única responsável por consumir matéria-prima.
    return tx.venda.create({ data: {
      produtoId, quantidade, cliente: cliente || null, nomeProduto: produto.nome,
      precoUnitario: produto.preco, total: new Prisma.Decimal(produto.preco).mul(quantidade),
    } });
  });
}
export async function registrarDespesa(entrada: unknown) {
  return db.despesa.create({ data: despesaSchema.parse(entrada) });
}
