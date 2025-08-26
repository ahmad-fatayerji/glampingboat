/*
  Warnings:

  - A unique constraint covering the columns `[bookingRef]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookingRef` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "bookingRef" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_bookingRef_key" ON "Reservation"("bookingRef");
