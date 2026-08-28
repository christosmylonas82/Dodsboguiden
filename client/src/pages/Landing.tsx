import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { TbAlertTriangle, TbQuestionMark, TbUsers, TbClockHour4, TbCheck, TbPlus } from 'react-icons/tb';
import heroFamily from '../assets/hero-family.jpg';

function FullBleed({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={`relative left-1/2 w-screen -translate-x-1/2 ${className ?? ''}`}>
      <div className="mx-auto max-w-[1200px] px-5 py-20">{children}</div>
    </section>
  );
}

function FreeBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface px-5 py-2 text-base font-medium text-text">
      Helt gratis att använda — ingen prenumeration, inga dolda avgifter
    </span>
  );
}

function CtaButtons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Link
        to="/register"
        className="rounded-lg bg-primary px-8 py-3.5 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-md"
      >
        Kom igång nu
      </Link>
      <Link
        to="/login"
        className="rounded-lg border border-border bg-surface px-8 py-3.5 font-medium text-text transition hover:-translate-y-0.5 hover:shadow-md"
      >
        Jag har redan ett konto
      </Link>
    </div>
  );
}

const challenges = [
  {
    icon: TbAlertTriangle,
    title: 'Saknar helhetsbild',
    text: 'Du vet inte vad du ska börja eller vad som är viktigt just nu.',
  },
  {
    icon: TbQuestionMark,
    title: 'Osäker på ordningen',
    text: 'Du är rädd för att göra saker i fel ordning eller missa något avgörande.',
  },
  {
    icon: TbUsers,
    title: 'Otydligt ansvar',
    text: 'Om ni är flera är det svårt att veta vem som ska göra vad.',
  },
  {
    icon: TbClockHour4,
    title: 'Mentalt kaos',
    text: 'Allt känns överväldigande och du har svårt att prioritera.',
  },
];

const benefits = [
  { title: 'Klar struktur', text: 'En väl organiserad checklista från start till slut' },
  { title: 'Delat ansvar', text: 'Tilldela uppgifter till familjemedlemmar enkelt' },
  { title: 'Rätt prioritet', text: 'Veta vad som behövs göra nu, och vad som kan vänta' },
  { title: 'Lugn och kontroll', text: 'Fokusera på det som är viktigt – familjen' },
];

const faqs = [
  {
    q: 'Vad är DödsboGuiden?',
    a: 'DödsboGuiden är ett beslutsstöd som ger dig struktur och överblick genom hela dödsboet. Du får en personlig översikt, tydliga prioriteringar och klara nästa steg. Vi skapar inga juridiska dokument, tar inte över ärenden och ersätter inte jurister eller myndigheter. Vi ger dig verktygen att fatta rätt beslut själv.',
  },
  {
    q: 'Vad gör DödsboGuiden INTE?',
    a: 'Vi skapar inga juridiska dokument som testamenten eller bouppteckningar. Vi tar inte över ditt ärende eller agerar ombud. Vi ersätter inte jurister, revisorer eller myndigheter. Vi ger ingen juridisk rådgivning. DödsboGuiden är ett beslutsstöd – inte en juridisk tjänst.',
  },
  {
    q: 'Hur hjälper DödsboGuiden mig att prioritera?',
    a: 'Du får en personlig översikt som visar vad som måste göras nu, vad som kan vänta, och vad som inte är relevant för just ditt dödsbo. Systemet hjälper dig avgöra vad som ska göras först baserat på din specifika situation.',
  },
  {
    q: 'När behöver jag professionell hjälp?',
    a: 'Vid komplicerade situationer med arvstvister, företag, utländska tillgångar eller juridiska oklarheter rekommenderar vi att du kontaktar en jurist. DödsboGuiden hjälper dig identifiera när sådan hjälp behövs.',
  },
  {
    q: 'Kan flera personer använda DödsboGuiden tillsammans?',
    a: 'Ja. Om ni är flera som hanterar dödsboet får ni hjälp att fördela ansvar och hålla koll på vad som är gjort och vad som återstår. Ni ser tydligt vem som ansvarar för vad och kan undvika dubbelarbete.',
  },
  {
    q: 'Vad kostar det?',
    a: 'Grundfunktionerna är kostnadsfria och inkluderar den personliga översikten, prioriteringar och de flesta mallar. Vi erbjuder även utökad funktionalitet för de som behöver extra stöd.',
  },
];

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface transition hover:shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 bg-transparent px-5 py-4 text-left"
      >
        <span className="font-medium text-text">{question}</span>
        <TbPlus
          size={20}
          className={`shrink-0 text-muted transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-[15px] leading-relaxed text-muted">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div>
      {/* Hero */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden">
        <img src={heroFamily} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/90 via-primary/80 to-primary/85" />
        <div className="relative mx-auto max-w-[1200px] px-5 py-20">
          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
              Samla allt på ett ställe, dela på arbetet tillsammans
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-[18px] sm:leading-[1.5]">
              Dödsbohantering behöver inte vara överväldigande. DödsboGuiden gör det enkelt för familjen att
              koordinera arbetet tillsammans – med struktur, klarhet och lugn.
            </p>
            <CtaButtons />
            <FreeBadge />
          </div>
        </div>
      </section>

      {/* Utmaningen */}
      <FullBleed className="bg-bg">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-2xl font-semibold text-text sm:text-3xl">
            Utmaningen är inte juridiken — det är överblicken
          </h2>
          <p className="max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base">
            De flesta dödsbon är inte juridiskt komplicerade. Problemet är att du saknar en tydlig bild av vad
            som ska göras, i vilken ordning, och vem som ansvarar för vad.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {challenges.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-surface p-6 transition duration-200 ease-out hover:-translate-y-1 hover:shadow-md"
            >
              <Icon size={28} className="text-warning" />
              <h3 className="mt-3 font-semibold text-text">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </FullBleed>

      {/* Lösning */}
      <FullBleed className="bg-surface">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-2xl font-semibold text-text sm:text-3xl">DödsboGuiden löser allt det här</h2>
          <p className="max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base">
            Se exakt vad som behöver göras, vem som gör vad, och i vilken ordning. Tydliga prioriteringar och
            klara nästa steg betyder att du alltid vet vad som ska hända härnäst – utan stress eller
            förvirring.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ title, text }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-bg p-6 transition duration-200 ease-out hover:-translate-y-1 hover:shadow-md"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success-light text-success">
                <TbCheck size={18} />
              </span>
              <h3 className="mt-3 font-semibold text-text">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center gap-6">
          <CtaButtons />
          <FreeBadge />
        </div>
      </FullBleed>

      {/* FAQ */}
      <FullBleed className="bg-primary-light">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-2xl font-semibold text-text sm:text-3xl">Vanliga frågor</h2>
          <p className="max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base">
            Tydliga svar på vad DödsboGuiden gör och inte gör.
          </p>
        </div>
        <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3">
          {faqs.map((item, index) => (
            <FaqItem
              key={item.q}
              question={item.q}
              answer={item.a}
              isOpen={openFaq === index}
              onToggle={() => setOpenFaq((prev) => (prev === index ? null : index))}
            />
          ))}
        </div>
      </FullBleed>
    </div>
  );
}
