import { deleteMultipleFilesFromR2 } from "../upload/upload.service";
import { prisma } from "../../server";

class FaunaService {
  async create(data: {
    name: string;
    scientificName: string;
    description: string;
    habitat: string;
    conservationStatus: string;
    imageUrls: string[];
  }) {
    const fauna = await prisma.fauna.create({
      data: {
        name: data.name,
        scientificName: data.scientificName,
        description: data.description,
        habitat: data.habitat,
        conservationStatus: data.conservationStatus,
        imageUrls: data.imageUrls,
      },
    });
    return fauna;
  }

  async findAll() {
    const faunas = await prisma.fauna.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return faunas;
  }

  async findOne(id: string) {
    const fauna = await prisma.fauna.findUnique({
      where: { id },
    });
    return fauna;
  }

  async update(
    id: string,
    data: {
      name?: string;
      scientificName?: string;
      description?: string;
      habitat?: string;
      conservationStatus?: string;
      imageUrls?: string[];
    }
  ) {
    const fauna = await prisma.fauna.update({
      where: { id },
      data,
    });
    return fauna;
  }

  async remove(id: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Buscar o registro da fauna para obter as URLs das imagens
      const faunaToDelete = await tx.fauna.findUnique({
        where: { id },
      });

      if (!faunaToDelete) {
        throw new Error(`Registro de fauna com ID ${id} não encontrado.`);
      }

      // 2. Se houver imagens, deletá-las do R2
      if (faunaToDelete.imageUrls && faunaToDelete.imageUrls.length > 0) {
        const publicUrlBase = process.env.R2_PUBLIC_URL;
        if (!publicUrlBase) {
          throw new Error("A URL pública do R2 não está configurada no .env");
        }

        const fileKeys = faunaToDelete.imageUrls.map((url) =>
          url.replace(`${publicUrlBase}/`, "")
        );

        try {
          await deleteMultipleFilesFromR2(fileKeys);
        } catch (error) {
          console.error(`Erro ao deletar imagens da fauna ${id} do R2.`, error);
          throw new Error(
            `Falha ao deletar imagens do R2. A operação foi cancelada.`
          );
        }
      }

      // 3. Deletar o registro do banco de dados
      await tx.fauna.delete({
        where: { id },
      });
    });
  }
}

export default new FaunaService();
