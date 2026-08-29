import { TbCalendarEvent, TbCoin, TbFileText, TbHome, TbPhone, TbUsers, TbListCheck } from 'react-icons/tb';
import type { IconType } from 'react-icons';

/**
 * Tasks have no category field in the data model, so the icon is inferred from
 * keywords in the (Swedish) title. Order matters: more specific themes are
 * checked before generic ones so e.g. "Kontakta begravningsbyrå" gets the
 * funeral icon rather than the generic contact one.
 */
const KEYWORD_ICON_RULES: { keywords: string[]; icon: IconType }[] = [
  {
    keywords: ['begravning', 'ceremoni', 'minnesstund', 'kondoleans', 'gravsten', 'urn', 'kremer'],
    icon: TbCalendarEvent,
  },
  {
    keywords: ['skuld', 'bank', 'betala', 'skatt', 'arv', 'ekonomi', 'faktura', 'försäkring', 'pengar', 'kostnad'],
    icon: TbCoin,
  },
  {
    keywords: ['dokument', 'intyg', 'bevis', 'testamente', 'bouppteckning', 'arkivera', 'blankett', 'skifte', 'fullmakt'],
    icon: TbFileText,
  },
  {
    keywords: ['bostad', 'hem', 'lägenhet', 'hus', 'möbler', 'töm'],
    icon: TbHome,
  },
  {
    keywords: ['familj', 'anhörig', 'arvinge', 'medlem', 'informera', 'delägare'],
    icon: TbUsers,
  },
  {
    keywords: ['kontakta', 'myndighet', 'anmäl', 'ansök', 'skatteverket', 'försäkringskassan', 'telefon'],
    icon: TbPhone,
  },
];

export function getIconForTask(title: string): IconType {
  const lower = title.toLowerCase();
  for (const rule of KEYWORD_ICON_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.icon;
  }
  return TbListCheck;
}
