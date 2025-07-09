import { FastifyInstance } from "fastify";
import { uploadFileToR2 } from "./upload.service";
import { randomUUID } from "crypto";
import { extname } from "path";

export async function uploadRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    console.log("[UPLOAD] Rota de upload iniciada.");

    try {
      const upload = await request.file();
      if (!upload) {
        return reply.status(400).send({ error: "Nenhum arquivo enviado." });
      }

      const buffer = await upload.toBuffer();

      const fileName = randomUUID().concat(extname(upload.filename));

      const fileUrl = await uploadFileToR2(fileName, buffer, upload.mimetype);

      return reply.status(201).send({ url: fileUrl });
    } catch (error) {
      return reply.status(500).send({ error: "Falha no upload do arquivo." });
    }
  });
}
