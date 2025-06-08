/*
  Warnings:

  - You are about to drop the column `productImageSnapshot` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `productNameSnapshot` on the `OrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "productImageSnapshot",
DROP COLUMN "productNameSnapshot";
