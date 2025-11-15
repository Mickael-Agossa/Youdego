-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('CREATED', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PenaltyType" AS ENUM ('DECLINE_ASSIGNMENT');

-- CreateTable
CREATE TABLE "deliveries" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "pickupAddress" TEXT,
    "dropoffAddress" TEXT,
    "notes" TEXT,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_locations" (
    "userId" TEXT NOT NULL,
    "currentAddress" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courier_locations_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "penalties" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deliveryId" TEXT,
    "type" "PenaltyType" NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "penalties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_ratings" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_declines" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_declines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deliveries_createdById_idx" ON "deliveries"("createdById");

-- CreateIndex
CREATE INDEX "deliveries_assignedToId_idx" ON "deliveries"("assignedToId");

-- CreateIndex
CREATE INDEX "deliveries_status_idx" ON "deliveries"("status");

-- CreateIndex
CREATE INDEX "penalties_userId_idx" ON "penalties"("userId");

-- CreateIndex
CREATE INDEX "penalties_deliveryId_idx" ON "penalties"("deliveryId");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_ratings_deliveryId_key" ON "delivery_ratings"("deliveryId");

-- CreateIndex
CREATE INDEX "delivery_ratings_courierId_idx" ON "delivery_ratings"("courierId");

-- CreateIndex
CREATE INDEX "delivery_ratings_createdById_idx" ON "delivery_ratings"("createdById");

-- CreateIndex
CREATE INDEX "delivery_declines_courierId_createdAt_idx" ON "delivery_declines"("courierId", "createdAt");

-- CreateIndex
CREATE INDEX "delivery_declines_deliveryId_idx" ON "delivery_declines"("deliveryId");

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_locations" ADD CONSTRAINT "courier_locations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penalties" ADD CONSTRAINT "penalties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penalties" ADD CONSTRAINT "penalties_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_ratings" ADD CONSTRAINT "delivery_ratings_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_ratings" ADD CONSTRAINT "delivery_ratings_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_ratings" ADD CONSTRAINT "delivery_ratings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_declines" ADD CONSTRAINT "delivery_declines_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_declines" ADD CONSTRAINT "delivery_declines_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
