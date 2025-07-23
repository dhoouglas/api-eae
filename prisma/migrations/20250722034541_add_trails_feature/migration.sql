-- CreateEnum
CREATE TYPE "TrailDifficulty" AS ENUM ('FACIL', 'MEDIO', 'DIFICIL');

-- CreateEnum
CREATE TYPE "TrailStatus" AS ENUM ('ABERTA', 'FECHADA', 'MANUTENCAO');

-- CreateEnum
CREATE TYPE "TrailType" AS ENUM ('CAMINHADA', 'CICLISMO', 'MISTA');

-- CreateTable
CREATE TABLE "trails" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "difficulty" "TrailDifficulty" NOT NULL,
    "estimatedTime" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "status" "TrailStatus" NOT NULL DEFAULT 'ABERTA',
    "type" "TrailType" NOT NULL,
    "elevationGain" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trail_coordinates" (
    "id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL,
    "trailId" TEXT NOT NULL,

    CONSTRAINT "trail_coordinates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trail_waypoints" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "trailId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trail_waypoints_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "trail_coordinates" ADD CONSTRAINT "trail_coordinates_trailId_fkey" FOREIGN KEY ("trailId") REFERENCES "trails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trail_waypoints" ADD CONSTRAINT "trail_waypoints_trailId_fkey" FOREIGN KEY ("trailId") REFERENCES "trails"("id") ON DELETE CASCADE ON UPDATE CASCADE;
