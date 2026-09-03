-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "has_co_ownership" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_company" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_digital_assets" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_foreign_assets" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_rental_property" BOOLEAN NOT NULL DEFAULT false;
