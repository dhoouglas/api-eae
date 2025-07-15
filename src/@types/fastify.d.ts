import { ClerkFastifyRequest } from "@clerk/fastify";
import { MultipartFile } from "@fastify/multipart";

declare module "fastify" {
  // Adicionamos a interface para o 'request.auth'
  export interface FastifyRequest {
    auth: ClerkFastifyRequest["auth"];
  }

  interface FastifyRequest {
    file: () => Promise<MultipartFile | undefined>;
  }
}
