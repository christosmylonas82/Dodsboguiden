-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "deadline_reminder_30_sent_at" TIMESTAMP(3),
ADD COLUMN     "deadline_reminder_60_sent_at" TIMESTAMP(3),
ADD COLUMN     "deadline_reminder_90_sent_at" TIMESTAMP(3);
