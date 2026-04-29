# <img src="logo.png" width="50" align="center" /> Instituto EAE - Backend API

![Banner](banner.png)

## 📖 Sobre o Instituto EAE

O **Instituto EAE (Educação Ambiental e Ecoturismo)** é uma organização dedicada à preservação ambiental, promoção do ecoturismo sustentável e educação sobre a biodiversidade. Esta API é o coração do ecossistema tecnológico do instituto, gerenciando dados críticos sobre fauna, flora, trilhas e usuários.

---

## 🛠️ Tecnologias Utilizadas

- **Runtime:** [Node.js](https://nodejs.org/) com [TypeScript](https://www.typescriptlang.org/)
- **Framework:** [Fastify](https://www.fastify.io/) (Alto desempenho e baixo overhead)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) (Hospedado via Supabase)
- **Autenticação:** [Clerk](https://clerk.com/)
- **Armazenamento de Arquivos:** Cloudflare R2 (S3 Compatible)
- **Validação:** [Zod](https://zod.dev/)

---

## 🚀 Como Começar

### Pré-requisitos
- Node.js (v18+)
- NPM ou Yarn
- Instância do PostgreSQL

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/api-eae.git
   cd api-eae
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto baseado no `.env.example` (ou use os valores fornecidos pelo administrador).

4. Gere o cliente do Prisma:
   ```bash
   npx prisma generate
   ```

5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

---

## 📁 Estrutura de Pastas

- `src/modules`: Divisão por funcionalidades (Flora, Fauna, Trilhas, etc.)
- `prisma/`: Schema do banco de dados e migrações.
- `src/server.ts`: Ponto de entrada da aplicação.

---

## ☁️ Deploy

A aplicação está configurada para deploy automático no **Render**. Toda alteração na branch `main` dispara um novo build.

---

## 📄 Licença

Este projeto é de uso exclusivo do **Instituto EAE**.
