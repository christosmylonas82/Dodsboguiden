import { TbCoins, TbHome, TbFileText, TbHeartHandshake } from 'react-icons/tb';
import { ModalOverlay } from './ModalOverlay';

const CATEGORIES = [
  {
    icon: TbHeartHandshake,
    title: 'Stöd och välmående',
    tips: [
      'Det är helt normalt att processen känns tung - ta hjälp av familj, vänner eller en jurist vid behov.',
      'Fördela uppgifterna mellan familjemedlemmarna så att inte allt hamnar på en person.',
      'Ta det i den takt ni orkar - de flesta steg har inga akuta deadlines.',
    ],
  },
  {
    icon: TbCoins,
    title: 'Ekonomi och betalningar',
    tips: [
      'Kontakta bankerna tidigt för att spärra kort och få kontoutdrag till bouppteckningen.',
      'Löpande räkningar (el, hyra, försäkring) kan ofta betalas från dödsboets konto tills boet är avslutat.',
      'Spara alla kvitton på utgifter som betalas för dödsboets räkning.',
    ],
  },
  {
    icon: TbHome,
    title: 'Bostad och egendom',
    tips: [
      'Säg upp eller ta över hyresavtal och abonnemang (el, bredband, försäkring) i god tid.',
      'Fota och lista värdefull egendom innan något flyttas eller säljs.',
      'Kontrollera om det finns lån eller pantbrev kopplade till fastigheten.',
    ],
  },
  {
    icon: TbFileText,
    title: 'Myndigheter och dokument',
    tips: [
      'Skatteverket får automatiskt information om dödsfallet, men bouppteckningen måste ni skicka in själva.',
      'Leta efter testamente, äktenskapsförord och försäkringsbrev - de påverkar bodelningen.',
      'Bouppteckningen ska vara inskickad till Skatteverket senast fyra månader efter dödsfallet.',
    ],
  },
];

export function TipsModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose} maxWidthClassName="max-w-2xl">
      <div className="max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)]">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-text">Tips och rekommendationer</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Stäng"
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-transparent text-muted hover:bg-primary-light hover:text-text"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-6">
          {CATEGORIES.map(({ icon: Icon, title, tips }) => (
            <div key={title}>
              <div className="flex items-center gap-2">
                <Icon size={20} className="text-primary-dark" />
                <h4 className="font-medium text-text">{title}</h4>
              </div>
              <ul className="mt-2 flex flex-col gap-1.5 pl-7 text-sm text-muted">
                {tips.map((tip) => (
                  <li key={tip} className="list-disc">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-transparent px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light"
          >
            Stäng
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
