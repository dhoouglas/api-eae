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
    await prisma.flora.delete({
      where: { id },
    });
  }
}

export default new FloraService();
