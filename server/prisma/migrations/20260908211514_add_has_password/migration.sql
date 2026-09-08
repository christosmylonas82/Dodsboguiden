-- AlterTable
ALTER TABLE "users" ADD COLUMN     "has_password" BOOLEAN NOT NULL DEFAULT true;

-- Backfill: existing accounts already linked to Google/Facebook were created
-- with a random unusable password (no way to log in with it), so they should
-- not be able to "change" a password they never knowingly set.
UPDATE "users" SET "has_password" = false WHERE "google_id" IS NOT NULL OR "facebook_id" IS NOT NULL;
