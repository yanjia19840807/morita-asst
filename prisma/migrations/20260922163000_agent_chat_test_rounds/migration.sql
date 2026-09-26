-- AlterTable
ALTER TABLE "agent" ADD COLUMN "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "agent" ADD COLUMN "historyLimit" INTEGER NOT NULL DEFAULT 20;
ALTER TABLE "agent" ADD COLUMN "retrieveTopK" INTEGER NOT NULL DEFAULT 4;

-- AlterTable
ALTER TABLE "conversation" ADD COLUMN "title" TEXT;

-- DropIndex
DROP INDEX "conversation_agentId_userId_key";

-- CreateIndex
CREATE INDEX "conversation_agentId_userId_idx" ON "conversation"("agentId", "userId");

-- AlterTable
ALTER TABLE "message" ADD COLUMN "run" JSONB;
