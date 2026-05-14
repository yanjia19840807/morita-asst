CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "chunk"
  ALTER COLUMN "vector" TYPE vector(1536)
  USING NULL::vector(1536);

UPDATE "chunk" AS c
SET
  "vector" = cv."vector",
  "embeddingStatus" = 'EMBEDDED'::"ChunkEmbeddingStatus"
FROM "chunk_vector" AS cv
WHERE c."embeddingId" IS NOT NULL
  AND cv."id"::text = c."embeddingId";

ALTER TABLE "chunk"
  DROP COLUMN IF EXISTS "embeddingId";

DROP TABLE IF EXISTS "chunk_vector";

CREATE INDEX IF NOT EXISTS "chunk_vector_ivfflat_idx"
  ON "chunk"
  USING ivfflat ("vector" vector_cosine_ops)
  WITH (lists = 100);