-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "reviewsAverage" DECIMAL NOT NULL DEFAULT 0,
ADD COLUMN     "reviewsCount" INTEGER NOT NULL DEFAULT 0;
