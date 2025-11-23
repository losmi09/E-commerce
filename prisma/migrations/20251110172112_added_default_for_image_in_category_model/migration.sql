/*
  Warnings:

  - Made the column `image` on table `categories` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "image" SET NOT NULL,
ALTER COLUMN "image" SET DEFAULT 'default.jpg',
ALTER COLUMN "image" SET DATA TYPE TEXT;
