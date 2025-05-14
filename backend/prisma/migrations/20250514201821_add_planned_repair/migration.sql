-- CreateTable
CREATE TABLE "PlannedRepair" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "cost" DOUBLE PRECISION,
    "notes" TEXT,
    "carId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlannedRepair_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlannedRepair" ADD CONSTRAINT "PlannedRepair_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;
