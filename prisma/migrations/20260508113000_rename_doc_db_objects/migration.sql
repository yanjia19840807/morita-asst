ALTER TYPE "KnowledgeDocumentStatus" RENAME TO "KnowledgeDocStatus";

ALTER TABLE "document" RENAME TO "doc";
ALTER TABLE "document-category" RENAME TO "doc-cate";
ALTER TABLE "knowledge-document" RENAME TO "knowledge-doc";

ALTER TABLE "knowledge" RENAME COLUMN "categoryId" TO "docCateId";
ALTER TABLE "doc" RENAME COLUMN "categoryId" TO "docCateId";
ALTER TABLE "knowledge-doc" RENAME COLUMN "documentId" TO "docId";
ALTER TABLE "chunk" RENAME COLUMN "knowledgeDocumentId" TO "knowledgeDocId";