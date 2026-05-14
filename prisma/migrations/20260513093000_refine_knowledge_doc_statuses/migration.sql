ALTER TYPE "KnowledgeDocStatus" RENAME TO "KnowledgeDocStatus_old";

CREATE TYPE "KnowledgeDocStatus" AS ENUM (
  'PENDING',
  'LOADING',
  'SPLITTING',
  'EMBEDDING',
  'READY',
  'FAILED'
);

ALTER TABLE "knowledge-doc"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "knowledge-doc"
  ALTER COLUMN "status" TYPE "KnowledgeDocStatus"
  USING (
    CASE
      WHEN "status"::text = 'UPLOADED' THEN 'PENDING'::"KnowledgeDocStatus"
      WHEN "status"::text = 'SPLITTED' THEN 'SPLITTING'::"KnowledgeDocStatus"
      ELSE "status"::text::"KnowledgeDocStatus"
    END
  );

ALTER TABLE "knowledge-doc"
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

DROP TYPE "KnowledgeDocStatus_old";