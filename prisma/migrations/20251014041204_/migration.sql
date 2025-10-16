/*
  Warnings:

  - You are about to drop the column `email_verification_token` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `email_verification_token_expiry` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "email_verification_token",
DROP COLUMN "email_verification_token_expiry",
DROP COLUMN "role",
ADD COLUMN     "role" VARCHAR(255) NOT NULL,
ALTER COLUMN "password_changed_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "password_reset_token" SET DATA TYPE TEXT,
ALTER COLUMN "password_reset_token_expiry" SET DATA TYPE TIMESTAMP(3);

-- DropEnum
DROP TYPE "public"."user_role";

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
