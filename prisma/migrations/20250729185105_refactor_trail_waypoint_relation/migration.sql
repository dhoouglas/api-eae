/*
  Warnings:

  - You are about to drop the column `latitude` on the `trail_waypoints` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `trail_waypoints` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[coordinateId]` on the table `trail_waypoints` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `coordinateId` to the `trail_waypoints` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "trail_waypoints" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "coordinateId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "trail_waypoints_coordinateId_key" ON "trail_waypoints"("coordinateId");

-- AddForeignKey
ALTER TABLE "trail_waypoints" ADD CONSTRAINT "trail_waypoints_coordinateId_fkey" FOREIGN KEY ("coordinateId") REFERENCES "trail_coordinates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
