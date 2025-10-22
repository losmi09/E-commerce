/*
  Warnings:

  - Added the required column `quantity` to the `Cart_Items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cart_Items" ADD COLUMN     "quantity" INTEGER NOT NULL;
