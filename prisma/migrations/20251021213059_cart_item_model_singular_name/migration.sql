/*
  Warnings:

  - You are about to drop the `Cart_Items` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Cart_Items" DROP CONSTRAINT "Cart_Items_cart_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Cart_Items" DROP CONSTRAINT "Cart_Items_product_id_fkey";

-- DropTable
DROP TABLE "public"."Cart_Items";

-- CreateTable
CREATE TABLE "Cart_Item" (
    "cart_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Cart_Item_pkey" PRIMARY KEY ("cart_id","product_id")
);

-- AddForeignKey
ALTER TABLE "Cart_Item" ADD CONSTRAINT "Cart_Item_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart_Item" ADD CONSTRAINT "Cart_Item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
