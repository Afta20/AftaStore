/*
  Warnings:

  - Added the required column `productNameSnapshot` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productImageSnapshot" TEXT,
ADD COLUMN     "productNameSnapshot" TEXT NOT NULL;
