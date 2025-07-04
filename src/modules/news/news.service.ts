import { prisma } from "../../server";

import { z } from "zod";

const createNewsPostSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  imageUrl: z.string().url("URL da imagem inválida").optional(),
});

const updateNewsPostSchema = createNewsPostSchema.partial();

export type CreateNewsInput = z.infer<typeof createNewsPostSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsPostSchema>;

export async function getLatestNewsService() {
  const newsPosts = await prisma.newsPost.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });
  return newsPosts;
}

export async function getNewsPostByIdService(id: string) {
  // findUniqueOrThrow já lida com o caso de "não encontrado"
  const newsPost = await prisma.newsPost.findUniqueOrThrow({
    where: { id },
  });
  return newsPost;
}

// POST
export async function createNewsPostService(input: CreateNewsInput) {
  // Valida os dados de entrada antes de criar
  const data = createNewsPostSchema.parse(input);
  return await prisma.newsPost.create({
    data,
  });
}

// PUT
export async function updateNewsPostService(
  id: string,
  input: UpdateNewsInput
) {
  const data = updateNewsPostSchema.parse(input);
  return await prisma.newsPost.update({
    where: { id },
    data,
  });
}

// DELETE
export async function deleteNewsPostService(id: string) {
  await prisma.newsPost.delete({
    where: { id },
  });
}
