import { prisma } from "../../server";
import { clerkClient } from "@clerk/clerk-sdk-node";

export interface CreateCommentInput {
    content: string;
    newsId?: string;
    eventId?: string;
}

export async function createCommentService(clerkUserId: string, data: CreateCommentInput) {
    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) throw new Error("Usuário não encontrado.");

    if (!data.newsId && !data.eventId) {
        throw new Error("A notícia (newsId) ou evento (eventId) é obrigatório.");
    }

    if (data.content.length > 500) {
        throw new Error("O comentário não pode ter mais de 500 caracteres.");
    }

    const created = await prisma.comment.create({
        data: {
            content: data.content,
            userId: user.id,
            newsId: data.newsId,
            eventId: data.eventId,
        },
        include: {
            user: { select: { id: true, clerkId: true } },
            reactions: true
        }
    });

    let clerkUser = null;
    try {
        clerkUser = await clerkClient.users.getUser(clerkUserId);
    } catch (e) {
        console.warn("Could not fetch user from clerk", e);
    }

    return {
        ...created,
        user: {
            ...created.user,
            firstName: clerkUser?.firstName || null,
            lastName: clerkUser?.lastName || null,
            imageUrl: clerkUser?.imageUrl || null
        }
    };
}

export async function getCommentsService(entityType: 'news' | 'event', entityId: string, page = 1) {
    const take = 5;
    const skip = (page - 1) * take;

    const where = entityType === 'news' ? { newsId: entityId } : { eventId: entityId };

    const comments = await prisma.comment.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, clerkId: true } },
            reactions: true
        }
    });

    const uniqueClerkIds = [...new Set(comments.map(c => c.user.clerkId))];
    let clerkUsers: any[] = [];
    if (uniqueClerkIds.length > 0) {
        try {
            const response = await clerkClient.users.getUserList({ userId: uniqueClerkIds });
            clerkUsers = Array.isArray(response) ? response : (response as any).data || [];
        } catch (e) {
            console.warn("Could not fetch users from clerk", e);
        }
    }

    return comments.map(comment => {
        const clerkUser = clerkUsers.find(u => u.id === comment.user.clerkId);
        return {
            ...comment,
            user: {
                ...comment.user,
                firstName: clerkUser?.firstName || null,
                lastName: clerkUser?.lastName || null,
                imageUrl: clerkUser?.imageUrl || null
            }
        };
    });
}

export async function updateCommentService(commentId: string, clerkUserId: string, newContent: string) {
    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) throw new Error("Usuário não encontrado.");

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new Error("Comentário não encontrado.");

    if (comment.userId !== user.id) {
        throw new Error("Forbidden");
    }

    if (newContent.length > 500) throw new Error("Limite de caracteres excedido.");

    return prisma.comment.update({
        where: { id: commentId },
        data: { content: newContent, isEdited: true }
    });
}

export async function deleteCommentService(commentId: string, clerkUserId: string, isAdmin: boolean) {
    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) throw new Error("Usuário não encontrado.");

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new Error("Comentário não encontrado.");

    if (!isAdmin && comment.userId !== user.id) {
        throw new Error("Forbidden");
    }

    return prisma.comment.delete({ where: { id: commentId } });
}

export async function reportCommentService(commentId: string) {
    return prisma.comment.update({
        where: { id: commentId },
        data: {
            isReported: true,
            reportCount: { increment: 1 }
        }
    });
}

export async function reactToCommentService(commentId: string, clerkUserId: string, type: 'LIKE' | 'DISLIKE') {
    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) throw new Error("Usuário não encontrado.");

    const existing = await prisma.commentReaction.findUnique({
        where: {
            userId_commentId: {
                userId: user.id,
                commentId
            }
        }
    });

    if (existing) {
        if (existing.type === type) {
            // Toggle off
            await prisma.commentReaction.delete({ where: { id: existing.id } });
            return { status: "removed" };
        } else {
            // Switch
            return prisma.commentReaction.update({
                where: { id: existing.id },
                data: { type }
            });
        }
    }

    return prisma.commentReaction.create({
        data: {
            userId: user.id,
            commentId,
            type
        }
    });
}

export async function getReportedCommentsService() {
    const comments = await prisma.comment.findMany({
        where: { isReported: true },
        orderBy: { reportCount: 'desc' },
        include: {
            user: { select: { id: true, clerkId: true } },
            reactions: true
        }
    });

    const uniqueClerkIds = [...new Set(comments.map(c => c.user.clerkId))];
    let clerkUsers: any[] = [];
    if (uniqueClerkIds.length > 0) {
        try {
            const response = await clerkClient.users.getUserList({ userId: [...uniqueClerkIds] });
            clerkUsers = Array.isArray(response) ? response : (response as any).data || [];
        } catch (e) {
            console.warn("Could not fetch users from clerk", e);
        }
    }

    return comments.map(comment => {
        const clerkUser = clerkUsers.find(u => u.id === comment.user.clerkId);
        return {
            ...comment,
            user: {
                ...comment.user,
                firstName: clerkUser?.firstName || null,
                lastName: clerkUser?.lastName || null,
                imageUrl: clerkUser?.imageUrl || null
            }
        };
    });
}

export async function dismissCommentReportService(commentId: string) {
    return prisma.comment.update({
        where: { id: commentId },
        data: {
            isReported: false,
            reportCount: 0
        }
    });
}
