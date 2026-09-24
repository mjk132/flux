-- AlterTable
ALTER TABLE "User" ADD COLUMN "discordId" TEXT;
ALTER TABLE "User" ADD COLUMN "discordUsername" TEXT;
ALTER TABLE "User" ADD COLUMN "discordAvatar" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");
CREATE INDEX "User_discordId_idx" ON "User"("discordId");
