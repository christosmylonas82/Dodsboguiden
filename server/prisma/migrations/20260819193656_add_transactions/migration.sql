-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('COST', 'INCOME');

-- CreateEnum
CREATE TYPE "TransactionCategory" AS ENUM ('BEGRAVNING', 'JURIDIK', 'MYNDIGHETER', 'FORSALJNING', 'OVRIGT');

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "category" "TransactionCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transactions_project_id_idx" ON "transactions"("project_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
