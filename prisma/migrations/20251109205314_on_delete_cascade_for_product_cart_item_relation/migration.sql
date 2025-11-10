-- DropForeignKey
ALTER TABLE "public"."cart_items" DROP CONSTRAINT "cart_items_product_id_fkey";

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
