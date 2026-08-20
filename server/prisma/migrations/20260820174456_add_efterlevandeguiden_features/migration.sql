-- CreateEnum
CREATE TYPE "PostTaskType" AS ENUM ('ADDRESS_CHANGE', 'MAIL_FORWARDING', 'AD_BLOCK');

-- CreateEnum
CREATE TYPE "PostTaskStatus" AS ENUM ('PENDING', 'DONE');

-- CreateEnum
CREATE TYPE "DigitalHeritageStatus" AS ENUM ('NOT_STARTED', 'MEMORIAL', 'DELETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PensionType" AS ENUM ('BARNPENSION', 'OMSTALLNINGSPENSION');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "selected_archive" TEXT;

-- CreateTable
CREATE TABLE "post_management_tasks" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "task_type" "PostTaskType" NOT NULL,
    "status" "PostTaskStatus" NOT NULL DEFAULT 'PENDING',
    "new_address" TEXT,
    "notes" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_management_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digital_heritage_items" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" "DigitalHeritageStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "digital_heritage_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surviving_pension_notes" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "pension_type" "PensionType" NOT NULL,
    "child_age" INTEGER,
    "studying_gymnasium" BOOLEAN,
    "survivor_age" INTEGER,
    "has_children" BOOLEAN,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surviving_pension_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "housing_benefit_notes" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "income_before_tax" INTEGER NOT NULL,
    "assets" INTEGER NOT NULL,
    "housing_cost" INTEGER NOT NULL,
    "likely_eligible" BOOLEAN NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "housing_benefit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_management_tasks_project_id_idx" ON "post_management_tasks"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_management_tasks_project_id_task_type_key" ON "post_management_tasks"("project_id", "task_type");

-- CreateIndex
CREATE INDEX "digital_heritage_items_project_id_idx" ON "digital_heritage_items"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "digital_heritage_items_project_id_platform_key" ON "digital_heritage_items"("project_id", "platform");

-- CreateIndex
CREATE INDEX "surviving_pension_notes_project_id_idx" ON "surviving_pension_notes"("project_id");

-- CreateIndex
CREATE INDEX "housing_benefit_notes_project_id_idx" ON "housing_benefit_notes"("project_id");

-- AddForeignKey
ALTER TABLE "post_management_tasks" ADD CONSTRAINT "post_management_tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_heritage_items" ADD CONSTRAINT "digital_heritage_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surviving_pension_notes" ADD CONSTRAINT "surviving_pension_notes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "housing_benefit_notes" ADD CONSTRAINT "housing_benefit_notes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
