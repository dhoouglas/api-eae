import { FastifyInstance } from "fastify";
import {
    createCommentHandler,
    getCommentsHandler,
    deleteCommentHandler,
    reactToCommentHandler,
    reportCommentHandler,
    updateCommentHandler,
    getReportedCommentsHandler,
    dismissReportHandler
} from "./comment.controller";

export async function commentRoutes(app: FastifyInstance) {
    app.get("/", getCommentsHandler);
    app.get("/reported", getReportedCommentsHandler);

    app.post("/", createCommentHandler);
    app.put("/:id", updateCommentHandler);
    app.delete("/:id", deleteCommentHandler);
    app.post("/:id/react", reactToCommentHandler);
    app.post("/:id/report", reportCommentHandler);
    app.post("/:id/dismiss-report", dismissReportHandler);
}
