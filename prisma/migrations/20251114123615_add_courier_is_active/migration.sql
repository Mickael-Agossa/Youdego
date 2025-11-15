-- CreateEnum
CREATE TYPE "DeliveryLocationSource" AS ENUM ('CURRENT_LOCATION', 'PREDEFINED_LOCATION');

-- AlterTable
ALTER TABLE "courier_locations" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "deliveries" ADD COLUMN     "dropoffComment" TEXT,
ADD COLUMN     "dropoffLatitude" DOUBLE PRECISION,
ADD COLUMN     "dropoffLocationId" TEXT,
ADD COLUMN     "dropoffLongitude" DOUBLE PRECISION,
ADD COLUMN     "dropoffSource" "DeliveryLocationSource",
ADD COLUMN     "pickupComment" TEXT,
ADD COLUMN     "pickupLatitude" DOUBLE PRECISION,
ADD COLUMN     "pickupLocationId" TEXT,
ADD COLUMN     "pickupLongitude" DOUBLE PRECISION,
ADD COLUMN     "pickupSource" "DeliveryLocationSource";

-- CreateTable
CREATE TABLE "map_locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "map_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "map_locations_active_idx" ON "map_locations"("active");

-- CreateIndex
CREATE INDEX "deliveries_pickupLocationId_idx" ON "deliveries"("pickupLocationId");

-- CreateIndex
CREATE INDEX "deliveries_dropoffLocationId_idx" ON "deliveries"("dropoffLocationId");

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "map_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_dropoffLocationId_fkey" FOREIGN KEY ("dropoffLocationId") REFERENCES "map_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
