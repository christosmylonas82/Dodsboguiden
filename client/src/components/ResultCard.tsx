import { Link } from 'react-router-dom';
import { TbCircleCheck, TbAlertTriangle, TbCircleX, TbExternalLink } from 'react-icons/tb';
import type { QuizResult } from '../lib/quiz';

const LAWYER_URL = 'https://www.advokatsamfundet.se/';
const ESTATE_INVENTORY_INFO_URL = 'https://www.skatteverket.se/';

const RESULT_CONTENT: Record<
  QuizResult,
  {
    icon: typeof TbCircleCheck;
    tone: 'success' | 'warning' | 'danger';
    title: string;
    body: string[];
  }
> = {
  fits: {
    icon: TbCircleCheck,
    tone: 'success',
    title: 'DödsboGuiden passar för dig',
    body: [
      'Bra nyheter! DödsboGuiden är utformat för din situation.',
      'Du kan med fördel använda appen för att hålla koll på alla uppgifter i en checklista, spåra ekonomin för dödsboet, organisera dokument och kontakter, och få vägledning steg för steg.',
      'Att hantera ett dödsbo kräver stort ansvar att det går rätt till. Om du känner dig osäker rekommenderar vi alltid att du konsulterar en advokat eller boutredningsman.',
    ],
  },
  warning: {
    icon: TbAlertTriangle,
    tone: 'warning',
    title: 'DödsboGuiden kan behöva kompletteras',
    body: [
      'DödsboGuiden kan användas, men ditt dödsbo har några särskilda omständigheter som kräver juridisk granskning.',
      'Vi rekommenderar att du även konsulterar en advokat eller boutredningsman, läser mer om din specifika situation, och dokumenterar all juridisk rådgivning du får. Du kan fortfarande använda appen för att organisera uppgifter och ekonomi, men säkerställ att en jurist granskar de juridiska processerna.',
    ],
  },
  'no-fit': {
    icon: TbCircleX,
    tone: 'danger',
    title: 'DödsboGuiden passar inte för dig',
    body: [
      'Ditt dödsbo verkar vara för komplext för DödsboGuiden att hantera på egen hand.',
      'Vi rekommenderar starkt att du kontaktar en advokat för juridisk rådgivning, bokar en boutredningsman som kan hantera processen, eller använder en juridisk tjänst specialiserad på dödsbon. En professionell kan se till att allt genomförs korrekt och att dina rättigheter är skyddade.',
    ],
  },
};

const TONE_CLASSES = {
  success: { bg: 'bg-success-light', text: 'text-success', border: 'border-success' },
  warning: { bg: 'bg-warning-light', text: 'text-warning', border: 'border-warning' },
  danger: { bg: 'bg-danger-light', text: 'text-danger', border: 'border-danger' },
};

export function ResultCard({ result, onRestart }: { result: QuizResult; onRestart: () => void }) {
  const content = RESULT_CONTENT[result];
  const tone = TONE_CLASSES[content.tone];
  const Icon = content.icon;

  return (
    <div className={`mx-auto max-w-xl rounded-xl border ${tone.border} ${tone.bg} p-6 sm:p-8`}>
      <div className="flex items-start gap-3">
        <Icon size={28} className={`mt-0.5 shrink-0 ${tone.text}`} />
        <h3 className="text-xl font-semibold text-text">{content.title}</h3>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {content.body.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-relaxed text-text">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {result === 'fits' && (
          <Link
            to="/register"
            className="rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
          >
            Börja nu
          </Link>
        )}

        {result === 'warning' && (
          <>
            <a
              href={LAWYER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4.5 py-2.5 text-sm font-medium text-text hover:bg-primary-light"
            >
              Hitta en jurist
              <TbExternalLink size={14} />
            </a>
            <Link
              to="/register"
              className="rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
            >
              Starta ändå
            </Link>
          </>
        )}

        {result === 'no-fit' && (
          <a
            href={LAWYER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Hitta en jurist
            <TbExternalLink size={14} />
          </a>
        )}
      </div>

      {result === 'no-fit' && (
        <a
          href={ESTATE_INVENTORY_INFO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-link hover:underline"
        >
          Läs mer om boutredning
          <TbExternalLink size={12} />
        </a>
      )}

      <button
        type="button"
        onClick={onRestart}
        className="mt-4 block bg-transparent p-0 text-sm text-muted hover:text-text hover:underline"
      >
        Gör testet igen
      </button>
    </div>
  );
}
