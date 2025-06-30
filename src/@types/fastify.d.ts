import { ClerkFastifyRequest, clerkPlugin } from "@clerk/fastify";

declare module "fastify" {
  // Adicionamos a interface para o 'app.authenticate'
  export interface FastifyInstance {
    authenticate: typeof clerkPlugin;
  }

  // Adicionamos a interface para o 'request.auth'
  export interface FastifyRequest {
    auth: ClerkFastifyRequest["auth"];
  }
}
