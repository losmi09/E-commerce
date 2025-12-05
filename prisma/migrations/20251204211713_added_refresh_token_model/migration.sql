-- CreateTable
CREATE TABLE "refresh_tokens" (
    "user_id" INTEGER NOT NULL,
    "refresh_token" VARCHAR(255) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_refresh_token_key" ON "refresh_tokens"("refresh_token");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
