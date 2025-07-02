-- CreateTable
CREATE TABLE "FluidCheckPlan" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "intervalDay" INTEGER NOT NULL,
    "lastCheck" TIMESTAMP(3) NOT NULL,
    "nextCheck" TIMESTAMP(3) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FluidCheckPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FluidCheckPlan_carId_key" ON "FluidCheckPlan"("carId");

-- AddForeignKey
ALTER TABLE "FluidCheckPlan" ADD CONSTRAINT "FluidCheckPlan_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
