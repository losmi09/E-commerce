/*
  Warnings:

  - You are about to drop the column `fileName` on the `product_images` table. All the data in the column will be lost.
  - You are about to drop the column `coverImage` on the `products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[file_name]` on the table `product_images` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `file_name` to the `product_images` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."product_images_fileName_key";

-- AlterTable
ALTER TABLE "product_images" DROP COLUMN "fileName",
ADD COLUMN     "file_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "coverImage",
ADD COLUMN     "cover_image" TEXT DEFAULT 'default.jpg';

-- CreateIndex
CREATE UNIQUE INDEX "product_images_file_name_key" ON "product_images"("file_name");
