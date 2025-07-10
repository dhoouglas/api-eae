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
    await prisma.fauna.delete({
      where: { id },
    });
  }
}

export default new FaunaService();
