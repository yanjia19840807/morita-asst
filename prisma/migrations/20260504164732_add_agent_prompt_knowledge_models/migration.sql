BEGIN;

CREATE TYPE "KnowledgeDocumentStatus" AS ENUM ('UPLOADED', 'SPLITTING', 'SPLITTED', 'EMBEDDING', 'READY', 'FAILED');
CREATE TYPE "ChunkEmbeddingStatus" AS ENUM ('PENDING', 'EMBEDDING', 'EMBEDDED', 'FAILED');
CREATE TYPE "AgentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DISABLED');

CREATE TABLE "agent" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "userId" TEXT NOT NULL,
        "status" "AgentStatus" NOT NULL DEFAULT 'DRAFT',
        "model" TEXT,
        "promptProfileId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "agent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent-knowledge" (
        "id" TEXT NOT NULL,
        "agentId" TEXT NOT NULL,
        "knowledgeId" TEXT NOT NULL,
        "priority" INTEGER NOT NULL DEFAULT 1,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "agent-knowledge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "prompt-profile" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "userId" TEXT NOT NULL,
        "systemPrompt" TEXT NOT NULL,
        "answerInstruction" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "prompt-profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "knowledge-document" (
        "id" TEXT NOT NULL,
        "knowledgeId" TEXT NOT NULL,
        "documentId" TEXT NOT NULL,
        "status" "KnowledgeDocumentStatus" NOT NULL DEFAULT 'UPLOADED',
        "errorMessage" TEXT,
        "lastIndexedAt" TIMESTAMP(3),
        "chunkCount" INTEGER NOT NULL DEFAULT 0,
        "embeddingModel" TEXT,
        "splitConfig" JSONB,
        "metadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "knowledge-document_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "document"
ADD COLUMN "sourceHash" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3);

UPDATE "document"
SET "updatedAt" = COALESCE("processedAt", "createdAt", CURRENT_TIMESTAMP)
WHERE "updatedAt" IS NULL;

ALTER TABLE "document"
ALTER COLUMN "updatedAt" SET NOT NULL;

INSERT INTO "knowledge-document" (
    "id",
    "knowledgeId",
    "documentId",
    "status",
    "errorMessage",
    "lastIndexedAt",
    "chunkCount",
    "createdAt",
    "updatedAt"
)
SELECT
    LOWER(
        SUBSTRING(MD5(d."knowledgeBaseId" || ':' || d."id") FROM 1 FOR 8) || '-' ||
        SUBSTRING(MD5(d."knowledgeBaseId" || ':' || d."id") FROM 9 FOR 4) || '-' ||
        SUBSTRING(MD5(d."knowledgeBaseId" || ':' || d."id") FROM 13 FOR 4) || '-' ||
        SUBSTRING(MD5(d."knowledgeBaseId" || ':' || d."id") FROM 17 FOR 4) || '-' ||
        SUBSTRING(MD5(d."knowledgeBaseId" || ':' || d."id") FROM 21 FOR 12)
    ) AS "id",
    d."knowledgeBaseId" AS "knowledgeId",
    d."id" AS "documentId",
    CASE d."status"::text
        WHEN 'UPLOADED' THEN 'UPLOADED'::"KnowledgeDocumentStatus"
        WHEN 'SPLITTED' THEN 'SPLITTED'::"KnowledgeDocumentStatus"
        WHEN 'NOT_EMBEDDED' THEN 'SPLITTED'::"KnowledgeDocumentStatus"
        WHEN 'EMBEDDING' THEN 'EMBEDDING'::"KnowledgeDocumentStatus"
        WHEN 'EMBEDDED' THEN 'READY'::"KnowledgeDocumentStatus"
        WHEN 'FAILED' THEN 'FAILED'::"KnowledgeDocumentStatus"
        ELSE 'UPLOADED'::"KnowledgeDocumentStatus"
    END AS "status",
    d."errorMessage",
    d."processedAt" AS "lastIndexedAt",
    COALESCE(chunk_counts."count", 0) AS "chunkCount",
    d."createdAt",
    COALESCE(d."processedAt", d."createdAt", CURRENT_TIMESTAMP) AS "updatedAt"
FROM "document" d
LEFT JOIN (
    SELECT "documentId", COUNT(*)::INTEGER AS "count"
    FROM "chunk"
    GROUP BY "documentId"
) AS chunk_counts ON chunk_counts."documentId" = d."id"
WHERE d."knowledgeBaseId" IS NOT NULL;

ALTER TABLE "chunk"
ADD COLUMN "knowledgeDocumentId" TEXT;

UPDATE "chunk" c
SET "knowledgeDocumentId" = kd."id"
FROM "knowledge-document" kd
WHERE kd."documentId" = c."documentId";

ALTER TABLE "chunk"
DROP CONSTRAINT IF EXISTS "chunk_documentId_fkey";

DROP INDEX IF EXISTS "chunk_documentId_idx";

ALTER TABLE "chunk"
ALTER COLUMN "embeddingStatus" DROP DEFAULT,
ALTER COLUMN "embeddingStatus" TYPE "ChunkEmbeddingStatus"
USING (
    CASE "embeddingStatus"::text
        WHEN 'NOT_EMBEDDED' THEN 'PENDING'::"ChunkEmbeddingStatus"
        WHEN 'EMBEDDING' THEN 'EMBEDDING'::"ChunkEmbeddingStatus"
        WHEN 'EMBEDDED' THEN 'EMBEDDED'::"ChunkEmbeddingStatus"
        WHEN 'FAILED' THEN 'FAILED'::"ChunkEmbeddingStatus"
        ELSE 'PENDING'::"ChunkEmbeddingStatus"
    END
),
ALTER COLUMN "embeddingStatus" SET DEFAULT 'PENDING';

ALTER TABLE "chunk"
ALTER COLUMN "knowledgeDocumentId" SET NOT NULL,
DROP COLUMN "documentId";

ALTER TABLE "document"
DROP CONSTRAINT IF EXISTS "Document_knowledgeBaseId_fkey";

DROP INDEX IF EXISTS "Document_knowledgeBaseId_idx";
DROP INDEX IF EXISTS "document_status_idx";
DROP INDEX IF EXISTS "chunk_embeddingStatus_idx";

ALTER TABLE "document"
DROP COLUMN "knowledgeBaseId",
DROP COLUMN "processedAt",
DROP COLUMN "status";

DROP TYPE "ProcessingStatus";

CREATE INDEX "agent_userId_idx" ON "agent"("userId");
CREATE INDEX "agent_promptProfileId_idx" ON "agent"("promptProfileId");
CREATE INDEX "agent_status_idx" ON "agent"("status");
CREATE UNIQUE INDEX "agent_userId_name_key" ON "agent"("userId", "name");

CREATE INDEX "agent-knowledge_agentId_idx" ON "agent-knowledge"("agentId");
CREATE INDEX "agent-knowledge_knowledgeId_idx" ON "agent-knowledge"("knowledgeId");
CREATE INDEX "agent-knowledge_priority_idx" ON "agent-knowledge"("priority");
CREATE UNIQUE INDEX "agent-knowledge_agentId_knowledgeId_key" ON "agent-knowledge"("agentId", "knowledgeId");

CREATE INDEX "prompt-profile_userId_idx" ON "prompt-profile"("userId");
CREATE UNIQUE INDEX "prompt-profile_userId_name_key" ON "prompt-profile"("userId", "name");

CREATE INDEX "knowledge-document_knowledgeId_idx" ON "knowledge-document"("knowledgeId");
CREATE INDEX "knowledge-document_documentId_idx" ON "knowledge-document"("documentId");
CREATE INDEX "knowledge-document_status_idx" ON "knowledge-document"("status");
CREATE UNIQUE INDEX "knowledge-document_knowledgeId_documentId_key" ON "knowledge-document"("knowledgeId", "documentId");

CREATE INDEX "chunk_knowledgeDocumentId_idx" ON "chunk"("knowledgeDocumentId");
CREATE INDEX "chunk_embeddingStatus_idx" ON "chunk"("embeddingStatus");
CREATE INDEX "document_sourceHash_idx" ON "document"("sourceHash");

ALTER TABLE "agent" ADD CONSTRAINT "agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent" ADD CONSTRAINT "agent_promptProfileId_fkey" FOREIGN KEY ("promptProfileId") REFERENCES "prompt-profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "agent-knowledge" ADD CONSTRAINT "agent-knowledge_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent-knowledge" ADD CONSTRAINT "agent-knowledge_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prompt-profile" ADD CONSTRAINT "prompt-profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "knowledge-document" ADD CONSTRAINT "knowledge-document_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "knowledge-document" ADD CONSTRAINT "knowledge-document_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chunk" ADD CONSTRAINT "chunk_knowledgeDocumentId_fkey" FOREIGN KEY ("knowledgeDocumentId") REFERENCES "knowledge-document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
