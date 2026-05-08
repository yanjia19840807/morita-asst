ALTER TABLE "agent"
ADD COLUMN "knowledgeId" TEXT;

UPDATE "agent" AS agent
SET "knowledgeId" = selected."knowledgeId"
FROM (
  SELECT DISTINCT ON ("agentId")
    "agentId",
    "knowledgeId"
  FROM "agent-knowledge"
  ORDER BY "agentId", "priority" ASC, "createdAt" ASC, "id" ASC
) AS selected
WHERE agent."id" = selected."agentId";

CREATE INDEX "agent_knowledgeId_idx" ON "agent"("knowledgeId");

ALTER TABLE "agent"
ADD CONSTRAINT "agent_knowledgeId_fkey"
FOREIGN KEY ("knowledgeId") REFERENCES "knowledge"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

DROP TABLE "agent-knowledge";