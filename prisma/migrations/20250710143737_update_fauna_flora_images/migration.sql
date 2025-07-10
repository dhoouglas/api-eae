/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `faunas` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `floras` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "faunas" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrls" TEXT[];

-- AlterTable
ALTER TABLE "floras" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrls" TEXT[];
