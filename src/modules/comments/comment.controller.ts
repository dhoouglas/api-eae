import { FastifyRequest, FastifyReply } from "fastify";
import {
    createCommentService,
    getCommentsService,
    deleteCommentService,
    reactToCommentService,
    reportCommentService,
    updateCommentService,
    getReportedCommentsService,
    dismissCommentReportService
} from "./comment.service";

export async function createCommentHandler(request: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
    const clerkUserId = (request as any).auth?.userId;
    if (!clerkUserId) return reply.status(401).send({ error: "Unauthorized. Precisa estar logado." });

    try {
        const comment = await createCommentService(clerkUserId, request.body as any);
        return reply.status(201).send({ comment });
    } catch (error: any) {
        return reply.status(400).send({ error: error.message });
    }
}

export async function getCommentsHandler(request: FastifyRequest<{ Querystring: { type: 'news' | 'event', id: string, page?: string } }>, reply: FastifyReply) {
    try {
        const { type, id, page } = request.query;
        if (!type || !id) {
            return reply.status(400).send({ error: "type e id são obrigatórios na query." });
        }
        const comments = await getCommentsService(type, id, page ? parseInt(page) : 1);
        return reply.send({ comments });
    } catch (error: any) {
        return reply.status(400).send({ error: error.message });
    }
}

export async function deleteCommentHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const clerkUserId = (request as any).auth?.userId;
    const isAdmin = (request as any).auth?.sessionClaims?.public_metadata?.role === "admin";

    if (!clerkUserId) return reply.status(401).send({ error: "Unauthorized" });

    try {
        await deleteCommentService(request.params.id, clerkUserId, isAdmin);
        return reply.status(204).send();
    } catch (error: any) {
        if (error.message === "Forbidden") return reply.status(403).send({ error: "Acesso negado. Apenas o autor ou admin." });
        return reply.status(404).send({ error: error.message });
    }
}

export async function updateCommentHandler(request: FastifyRequest<{ Params: { id: string }, Body: { content: string } }>, reply: FastifyReply) {
    const clerkUserId = (request as any).auth?.userId;
    if (!clerkUserId) return reply.status(401).send({ error: "Unauthorized" });

    try {
        const comment = await updateCommentService(request.params.id, clerkUserId, request.body.content);
        return reply.send({ comment });
    } catch (error: any) {
        if (error.message === "Forbidden") return reply.status(403).send({ error: "Acesso negado. Você só pode editar seu próprio comentário." });
        return reply.status(400).send({ error: error.message });
    }
}

export async function reactToCommentHandler(request: FastifyRequest<{ Params: { id: string }, Body: { type: 'LIKE' | 'DISLIKE' } }>, reply: FastifyReply) {
    const clerkUserId = (request as any).auth?.userId;
    if (!clerkUserId) return reply.status(401).send({ error: "Unauthorized" });

    try {
        const reaction = await reactToCommentService(request.params.id, clerkUserId, request.body.type);
        return reply.send({ reaction });
    } catch (error: any) {
        return reply.status(400).send({ error: error.message });
    }
}

export async function reportCommentHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const clerkUserId = (request as any).auth?.userId;
    if (!clerkUserId) return reply.status(401).send({ error: "Unauthorized" });

    try {
        const comment = await reportCommentService(request.params.id);
        return reply.send({ message: "Comentário reportado com sucesso", comment });
    } catch (error: any) {
        return reply.status(400).send({ error: error.message });
    }
}

export async function getReportedCommentsHandler(request: FastifyRequest, reply: FastifyReply) {
    const isAdmin = (request as any).auth?.sessionClaims?.public_metadata?.role === "admin";
    if (!isAdmin) return reply.status(403).send({ error: "Acesso negado. Apenas administradores." });

    try {
        const comments = await getReportedCommentsService();
        return reply.send({ comments });
    } catch (error: any) {
        return reply.status(400).send({ error: error.message });
    }
}

export async function dismissReportHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const isAdmin = (request as any).auth?.sessionClaims?.public_metadata?.role === "admin";
    if (!isAdmin) return reply.status(403).send({ error: "Acesso negado. Apenas administradores." });

    try {
        const comment = await dismissCommentReportService(request.params.id);
        return reply.send({ message: "Denúncia ignorada com sucesso", comment });
    } catch (error: any) {
        return reply.status(400).send({ error: error.message });
    }
}
