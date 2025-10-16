CREATE TYPE user_role AS ENUM ('user', 'admin');

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" user_role,
    "password" VARCHAR(255) NOT NULL,
    "password_changed_at" TIMESTAMP,
    "password_reset_token" VARCHAR(300),
    "password_reset_token_expiry" TIMESTAMP,
    "email_verification_token" VARCHAR(300),
    "email_verification_token_expiry" TIMESTAMP,
    "isVerified" BOOLEAN DEFAULT FALSE,


    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
