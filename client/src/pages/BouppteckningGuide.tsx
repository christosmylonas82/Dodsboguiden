import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TbArrowLeft, TbChevronDown, TbExternalLink, TbDownload, TbAlertTriangle, TbAlertCircle, TbCircleCheck } from 'react-icons/tb';
import { apiFetch } from '../lib/api';
import type { InventoryItem, ProjectDetail, Transaction } from '../lib/types';
import { HELP_TEXT } from '../lib/helpText';
import { HelpIcon } from '../components/HelpIcon';

function isDebt(item: InventoryItem): boolean {
  return item.type.toLowerCase().includes('skuld') || item.value < 0;
}

function daysUntilDeadline(deceasedDate: string): number {
  const deadline = new Date(deceasedDate);
  deadline.setMonth(deadline.getMonth() + 4);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  return Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function BouppteckningGuidePage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expandedStep, setExpandedStep] = useState(0);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiFetch<ProjectDetail>(`/projects/${id}`),
      apiFetch<InventoryItem[]>(`/projects/${id}/inventory`),
      apiFetch<Transaction[]>(`/projects/${id}/transactions`),
    ]).then(([p, inv, tx]) => {
      setProject(p);
      setInventory(inv);
      setTransactions(tx);
    });
  }, [id]);

  if (!project) return <p className="text-muted">Laddar…</p>;

  const totalAssetValue = inventory.filter((i) => !isDebt(i) && i.value > 0).reduce((sum, i) => sum + i.value, 0);
  const totalCosts = transactions.filter((t) => t.type === 'COST').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const netValue = totalAssetValue - totalCosts;
  const deadlineDays = project.deceasedDate ? daysUntilDeadline(project.deceasedDate) : null;

  function formatCurrency(value: number): string {
    return `${value.toLocaleString('sv-SE')} kr`;
  }

  const steps = [
    {
      title: 'Samla information',
      description: 'Inventera all egendom och ordna dokument',
      details: [
        `Öppna "Inventarielista" i menyn för att se och komplettera din inventering.`,
        `Du har registrerat ${inventory.length} poster i inventarielistan.`,
        `Totalt värde på tillgångar hittills: ${formatCurrency(totalAssetValue)}.`,
        'Samla dödsfallsintyg, testamente och andra viktiga dokument under "Dokument".',
      ],
    },
    {
      title: 'Beräkna ekonomi',
      description: 'Registrera kostnader och intäkter',
      details: [
        'Öppna "Ekonomi" i menyn för att registrera begravningskostnader och eventuella intäkter.',
        `Registrerade kostnader hittills: ${formatCurrency(totalCosts)}.`,
        `Registrerade intäkter hittills: ${formatCurrency(totalIncome)}.`,
        `Netto (intäkter − kostnader): ${formatCurrency(totalIncome - totalCosts)}.`,
      ],
    },
    {
      title: 'Håll möte (Förrättning)',
      description: 'Ett obligatoriskt möte för att granska all dokumentation',
      isNew: true,
      details: [
        'Skicka kallelse 2–4 veckor före mötet till alla dödsbodelägare och efterarvingar.',
        'Bevis på kallelse: skriftlig bekräftelse eller Postens kvitto krävs.',
        'Förrättningsperson: två oberoende personer (kan vara anhöriga, behöver inte vara jurist).',
        'Bouppgivaren och minst en förrättningsperson måste närvara vid mötet.',
      ],
    },
    {
      title: 'Ladda ner & fyll i formulär (SKV 4600)',
      description: 'Förbered och komplettera den officiella bouppteckningen',
      details: [
        'Blanketten heter SKV 4600 och anvisningarna finns i broschyr SKV 461 — båda finns kostnadsfritt på skatteverket.se.',
        'Du behöver: dödsfallsintyg med släktutredning, lista över tillgångar och skulder med värderingar, samt uppgift om arvingar.',
        'Fyll i uppgifter om den avlidne, bouppgivare och dödsbodelägare.',
        'Lista alla tillgångar från din inventering, med värden vid dödsdagen.',
        'Lista alla skulder och kostnader (t.ex. begravningskostnader) från din ekonomiöversikt.',
        'Bouppgivaren och två förrättningspersoner (som inte är arvingar) ska underteckna dokumentet.',
        'Har du frågor: ring Skatteverkets skatteupplysning på 0771-567 567.',
      ],
      external: {
        label: 'Öppna Skatteverkets sida om bouppteckning',
        href: 'https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/bouppteckning.4.18e1b10334ebe8bc80001217.html',
      },
    },
    {
      title: 'Skicka in bouppteckningen',
      description: 'Till Skatteverket innan deadline',
      details: [
        'Digital bouppteckning är möjlig sedan 1 juli 2026, som alternativ till att skicka in på papper.',
        'Skicka in original och en bestyrkt kopia — inte längre två kopior.',
        'Vilket av Skatteverkets kontor som handlägger ärendet beror på var den avlidne var folkbokförd — rätt adress hittar du på skatteverket.se eller genom att ringa 0771-567 567. Det finns ingen enda gemensam postadress.',
        'Deadline: bouppteckningen ska ha kommit in till Skatteverket senast 4 månader efter dödsfallet.',
      ],
    },
  ];

  function handleExport() {
    const summary = [
      'BOUPPTECKNINGS-SAMMANFATTNING',
      '=============================',
      '',
      `Dödsbo: ${project.deceasedName}`,
      `Antal poster i inventarielistan: ${inventory.length}`,
      `Värde på tillgångar: ${formatCurrency(totalAssetValue)}`,
      '',
      `Kostnader: ${formatCurrency(totalCosts)}`,
      `Intäkter: ${formatCurrency(totalIncome)}`,
      `Netto: ${formatCurrency(totalIncome - totalCosts)}`,
      '',
      'Genererad från Dödsbo Guide',
      `Datum: ${new Date().toLocaleDateString('sv-SE')}`,
    ].join('\n');

    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bouppteckning-sammanfattning-${project.deceasedName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <Link to={`/projects/${id}/dashboard`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary-dark">
        <TbArrowLeft size={16} />
        Tillbaka till dashboard
      </Link>

      <div className="mt-2 flex items-center gap-2">
        <h1 className="text-3xl font-semibold text-text">Boupptecknings-guide</h1>
        <HelpIcon text={HELP_TEXT.bouppteckningGuide} />
      </div>
      <p className="mt-1 text-muted">En steg-för-steg-guide genom Skatteverkets bouppteckningsprocess.</p>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-warning bg-warning-light p-4 text-sm">
        <TbAlertCircle size={20} className="mt-0.5 shrink-0 text-warning" />
        <div>
          <p className="font-semibold text-text">Ny lag från 1 juli 2026</p>
          <p className="mt-1 text-text">
            Digital bouppteckning är nu möjlig. Kopia på bouppteckningen ska inte längre skickas in. Personnummer
            måste anges på alla kallade.
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-3 rounded-xl border border-warning bg-warning-light p-4 text-sm">
        <TbAlertTriangle size={20} className="mt-0.5 shrink-0 text-warning" />
        <div>
          <p className="font-semibold text-text">Deadline: 4 månader efter dödsfallet</p>
          {deadlineDays !== null ? (
            <p className="mt-1 text-text">
              {deadlineDays >= 0
                ? `Baserat på det angivna dödsdatumet har du ungefär ${deadlineDays} dagar kvar.`
                : `Baserat på det angivna dödsdatumet har deadline passerat för ${Math.abs(deadlineDays)} dagar sedan — kontakta Skatteverket snarast.`}
            </p>
          ) : (
            <p className="mt-1 text-text">
              Inget dödsdatum är angivet för dödsboet, så vi kan inte räkna ut din exakta deadline. Ange det via "Redigera namn" om du vill se en uppskattning.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {steps.map((step, idx) => (
          <div
            key={step.title}
            className={`overflow-hidden rounded-xl bg-surface ${
              step.isNew ? 'border-2 border-primary' : 'border border-border'
            }`}
          >
            <button
              type="button"
              onClick={() => setExpandedStep(expandedStep === idx ? -1 : idx)}
              className="grid w-full grid-cols-[40px_1fr_auto] items-center gap-3 p-4 text-left bg-surface hover:bg-primary-light"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                {idx + 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text">{step.title}</span>
                  {step.isNew && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Ny
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted">{step.description}</div>
              </div>
              <TbChevronDown size={20} className={`text-muted transition-transform ${expandedStep === idx ? 'rotate-180' : ''}`} />
            </button>

            {expandedStep === idx && (
              <div className="border-t border-border bg-bg p-4">
                <ul className="list-disc space-y-2 pl-5 text-sm text-text">
                  {step.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
                {step.external && (
                  <a
                    href={step.external.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-light px-3 py-2 text-sm font-medium text-primary-dark hover:underline"
                  >
                    {step.external.label}
                    <TbExternalLink size={14} />
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-5">
        <h3 className="text-base font-semibold text-text">Din sammanfattning för bouppteckning</h3>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <div className="text-xs text-muted">Poster i inventering</div>
            <div className="mt-1 text-xl font-semibold text-text">{inventory.length}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Värde på tillgångar</div>
            <div className="mt-1 text-xl font-semibold text-text">{formatCurrency(totalAssetValue)}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Kostnader</div>
            <div className="mt-1 text-xl font-semibold text-danger">-{formatCurrency(totalCosts)}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Netto</div>
            <div className={`mt-1 text-xl font-semibold ${netValue >= 0 ? 'text-success' : 'text-danger'}`}>
              {netValue >= 0 ? '+' : ''}
              {formatCurrency(netValue)}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-primary px-4.5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <TbDownload size={16} />
          Exportera sammanfattning
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-success bg-success-light p-5">
        <h3 className="text-base font-semibold text-text">Kontakta Skatteverket</h3>
        <div className="mt-2 space-y-1 text-sm text-text">
          <p>
            <strong>Telefon:</strong> 0771-567 567 (skatteupplysningen, lokalsamtalstaxa)
          </p>
          <p>
            <strong>Webb:</strong>{' '}
            <a
              href="https://www.skatteverket.se/privat/folkbokforing/narenanhorigdor/bouppteckning.4.18e1b10334ebe8bc80001217.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-dark hover:underline"
            >
              skatteverket.se — bouppteckning
            </a>
          </p>
          <p className="text-muted">Rätt mottagande kontor och postadress beror på var den avlidne var folkbokförd — ring eller sök på skatteverket.se.</p>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-success bg-success-light p-4 text-sm">
        <TbCircleCheck size={20} className="mt-0.5 shrink-0 text-success" />
        <div>
          <p className="font-semibold text-text">Du kan använda Dödsboguiden för denna process</p>
          <p className="mt-1 text-text">Men granska alltid juridiska krav med en expert vid behov.</p>
        </div>
      </div>
    </div>
  );
}
