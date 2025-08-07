/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `trails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "trails" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrls" TEXT[];
