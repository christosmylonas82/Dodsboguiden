-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('NOW', 'SOON', 'LATER');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "priority" "TaskPriority",
ADD COLUMN     "responsible_role" TEXT,
ADD COLUMN     "time_estimate" TEXT;
