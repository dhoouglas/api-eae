import { pushNotificationService } from "../notifications/push-notification.service";
import { prisma } from "../../server";

import { z } from "zod";

const createNewsPostSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  // imageUrl: z.string().url("URL da imagem inválida").optional(),
  imageUrl: z
    .string()
    .url({ message: "URL da imagem inválida." })
    .nullable()
    .optional(),
});

const updateNewsPostSchema = createNewsPostSchema.partial();

export type CreateNewsInput = z.infer<typeof createNewsPostSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsPostSchema>;

// GET
export async function getLatestNewsService() {
  const newsPosts = await prisma.newsPost.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });
  return newsPosts;
}

// GET BY ID
export async function getNewsPostByIdService(id: string) {
  const newsPost = await prisma.newsPost.findUniqueOrThrow({
    where: { id },
  });
  return newsPost;
}

// POST
export async function createNewsPostService(input: CreateNewsInput) {
  const data = createNewsPostSchema.parse(input);
  const newPost = await prisma.newsPost.create({
    data,
  });

  // Enviar notificação para usuários interessados
  const usersToNotify = await prisma.user.findMany({
    where: {
      notifyOnNews: true,
      pushToken: {
        not: null,
      },
    },
  });

  for (const user of usersToNotify) {
    if (user.pushToken) {
      pushNotificationService.sendPushNotification(
        user.pushToken,
        "Nova Notícia!",
        newPost.title
      );
    }
  }

  return newPost;
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
