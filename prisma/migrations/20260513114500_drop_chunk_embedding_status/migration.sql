DROP INDEX IF EXISTS "chunk_embeddingStatus_idx";

ALTER TABLE "chunk"
  DROP COLUMN IF EXISTS "embeddingStatus";

DROP TYPE IF EXISTS "ChunkEmbeddingStatus";