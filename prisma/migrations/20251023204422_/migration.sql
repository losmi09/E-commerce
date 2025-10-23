/*
  Warnings:

  - You are about to alter the column `reviewsAverage` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(1,1)`.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "reviewsAverage" SET DATA TYPE DECIMAL(1,1);
