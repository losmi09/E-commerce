/*
  Warnings:

  - You are about to drop the column `productsCount` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "productsCount",
ADD COLUMN     "products_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "product_images" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_images_fileName_key" ON "product_images"("fileName");

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
