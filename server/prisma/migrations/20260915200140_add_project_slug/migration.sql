-- Add a human-readable, stable URL slug per project (e.g. "erik-andersson-a1b2c3")
-- so links look nicer than the raw UUID. Added nullable first so we can backfill
-- existing rows before enforcing NOT NULL + UNIQUE.
ALTER TABLE "projects" ADD COLUMN "slug" TEXT;

-- Backfill: lowercase the deceased's name, transliterate åäö, collapse anything
-- that isn't a-z/0-9 into a single dash, trim leading/trailing dashes, then
-- append a short random suffix so same-name projects never collide.
UPDATE "projects"
SET "slug" = trim(both '-' from regexp_replace(
               lower(translate("deceased_name", 'åäöÅÄÖ', 'aaoaao')),
               '[^a-z0-9]+', '-', 'g'
             )) || '-' || substr(md5(random()::text || "id"), 1, 6)
WHERE "slug" IS NULL;

ALTER TABLE "projects" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");
