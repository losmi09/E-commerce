/*
  Warnings:

  - Added the required column `extension` to the `product_images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `human_readable_size` to the `product_images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `product_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "extension" VARCHAR(20) NOT NULL,
ADD COLUMN     "human_readable_size" VARCHAR(255) NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;
