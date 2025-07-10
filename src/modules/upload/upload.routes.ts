// import { FastifyInstance } from "fastify";
// import { uploadFileToR2 } from "./upload.service";
// import { randomUUID } from "crypto";
// import { extname } from "path";

// export async function uploadRoutes(app: FastifyInstance) {
//   app.post("/", async (request, reply) => {
//     console.log("[UPLOAD] Rota de upload iniciada.");

//     try {
//       const upload = await request.file();
//       if (!upload) {
//         return reply.status(400).send({ error: "Nenhum arquivo enviado." });
//       }

//       const buffer = await upload.toBuffer();

//       const fileName = randomUUID().concat(extname(upload.filename));

//       const fileUrl = await uploadFileToR2(fileName, buffer, upload.mimetype);

//       return reply.status(201).send({ url: fileUrl });
//     } catch (error) {
//       return reply.status(500).send({ error: "Falha no upload do arquivo." });
//     }
//   });
// }

import { FastifyInstance } from "fastify";
import { uploadFileToR2 } from "./upload.service";
import { randomUUID } from "crypto";
import { extname } from "path";

export async function uploadRoutes(app: FastifyInstance) {
  // A rota continua protegida pelo preHandler do Clerk
  app.post("/", async (request, reply) => {
    console.log("\n[UPLOAD ROTA] - 1. Requisição de upload recebida.");
    try {
      const upload = await request.file();
      if (!upload) {
        console.error(
          "[UPLOAD ROTA] - ERRO: Nenhum arquivo foi enviado na requisição."
        );
        return reply.status(400).send({ error: "Nenhum arquivo enviado." });
      }
      console.log(`[UPLOAD ROTA] - 2. Arquivo '${upload.filename}' recebido.`);

      const buffer = await upload.toBuffer();
      console.log(
        `[UPLOAD ROTA] - 3. Arquivo convertido para buffer. Tamanho: ${buffer.length} bytes.`
      );

      const fileName = randomUUID().concat(extname(upload.filename));
      console.log(
        `[UPLOAD ROTA] - 4. Chamando o serviço para enviar '${fileName}' para o R2...`
      );

      const fileUrl = await uploadFileToR2(fileName, buffer, upload.mimetype);
      console.log(
        `[UPLOAD ROTA] - 5. SUCESSO! Serviço retornou a URL: ${fileUrl}`
      );

      return reply.status(201).send({ url: fileUrl });
    } catch (error) {
      // Este log irá capturar o erro exato, seja do Fastify ou do nosso serviço
      console.error("[UPLOAD ROTA] - ERRO FATAL no bloco try/catch:", error);
      return reply.status(500).send({ error: "Falha no upload do arquivo." });
    }
  });
}
