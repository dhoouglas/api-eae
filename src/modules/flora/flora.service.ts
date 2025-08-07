import { deleteMultipleFilesFromR2 } from "../upload/upload.service";
import { prisma } from "../../server";

class FloraService {
  async create(data: {
    name: string;
    scientificName: string;
    description: string;
    family: string;
    conservationStatus: string;
    imageUrls: string[];
  }) {
    const flora = await prisma.flora.create({
      data: {
        name: data.name,
        scientificName: data.scientificName,
        description: data.description,
        family: data.family,
        conservationStatus: data.conservationStatus,
        imageUrls: data.imageUrls,
      },
    });
    return flora;
  }

  async findAll() {
    const floras = await prisma.flora.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return floras;
  }

  async findOne(id: string) {
    const flora = await prisma.flora.findUnique({
      where: { id },
    });
    return flora;
  }

  async update(
    id: string,
    data: {
      name?: string;
      scientificName?: string;
      description?: string;
      family?: string;
      conservationStatus?: string;
      imageUrls?: string[];
    }
  ) {
    const flora = await prisma.flora.update({
      where: { id },
      data,
    });
    return flora;
  }

  async remove(id: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Buscar o registro da flora para obter as URLs das imagens
      const floraToDelete = await tx.flora.findUnique({
        where: { id },
      });

      if (!floraToDelete) {
        throw new Error(`Registro de flora com ID ${id} não encontrado.`);
      }

      // 2. Se houver imagens, deletá-las do R2
      if (floraToDelete.imageUrls && floraToDelete.imageUrls.length > 0) {
        const publicUrlBase = process.env.R2_PUBLIC_URL;
        if (!publicUrlBase) {
          throw new Error("A URL pública do R2 não está configurada no .env");
        }

        const fileKeys = floraToDelete.imageUrls.map((url) =>
          url.replace(`${publicUrlBase}/`, "")
        );

        try {
          await deleteMultipleFilesFromR2(fileKeys);
        } catch (error) {
          console.error(`Erro ao deletar imagens da flora ${id} do R2.`, error);
          throw new Error(
            `Falha ao deletar imagens do R2. A operação foi cancelada.`
          );
        }
      }

      // 3. Deletar o registro do banco de dados
      await tx.flora.delete({
        where: { id },
      });
    });
  }
}

export default new FloraService();
