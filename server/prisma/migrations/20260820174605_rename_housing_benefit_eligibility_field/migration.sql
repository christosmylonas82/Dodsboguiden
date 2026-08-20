/*
  Warnings:

  - You are about to drop the column `likely_eligible` on the `housing_benefit_notes` table. All the data in the column will be lost.
  - Added the required column `meets_age_requirement` to the `housing_benefit_notes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "housing_benefit_notes" DROP COLUMN "likely_eligible",
ADD COLUMN     "meets_age_requirement" BOOLEAN NOT NULL;
