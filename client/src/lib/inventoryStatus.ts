import type { InventoryStatus } from './types';

export const INVENTORY_STATUS_LABELS: Record<InventoryStatus, string> = {
  NOT_INVENTORIED: 'Ej inventerad',
  INVENTORIED: 'Inventerad',
  VALUED: 'Värderad',
  SOLD: 'Såld',
};

export const INVENTORY_STATUS_ORDER: InventoryStatus[] = ['NOT_INVENTORIED', 'INVENTORIED', 'VALUED', 'SOLD'];
