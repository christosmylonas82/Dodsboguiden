-- CreateTable
CREATE TABLE "quiz_responses" (
    "id" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "domicile" TEXT,
    "will" TEXT,
    "family_situation" TEXT,
    "complexity" TEXT,
    "company" TEXT,
    "co_ownership" TEXT,
    "foreign_assets" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_responses_pkey" PRIMARY KEY ("id")
);
