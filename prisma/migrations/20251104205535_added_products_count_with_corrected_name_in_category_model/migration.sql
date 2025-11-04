/*
  Warnings:

  - You are about to drop the column `categories` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "categories",
ADD COLUMN     "productsCount" INTEGER NOT NULL DEFAULT 0;
