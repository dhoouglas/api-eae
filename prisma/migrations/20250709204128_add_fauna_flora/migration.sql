-- CreateTable
CREATE TABLE "faunas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "habitat" TEXT NOT NULL,
    "conservationStatus" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faunas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "floras" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "conservationStatus" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "floras_pkey" PRIMARY KEY ("id")
);
