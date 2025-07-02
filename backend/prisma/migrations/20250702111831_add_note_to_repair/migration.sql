/*
  Warnings:

  - You are about to drop the column `note` on the `Repair` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Repair" DROP COLUMN "note",
ADD COLUMN     "notes" TEXT;
