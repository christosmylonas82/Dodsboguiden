-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('NOT_INVENTORIED', 'INVENTORIED', 'VALUED', 'SOLD');

-- AlterTable
ALTER TABLE "inventory_items" ADD COLUMN     "status" "InventoryStatus" NOT NULL DEFAULT 'NOT_INVENTORIED';
