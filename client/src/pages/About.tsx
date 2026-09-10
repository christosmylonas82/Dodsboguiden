import { Link } from 'react-router-dom';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14 first:mt-0">
      <h2 className="text-2xl font-semibold text-text sm:text-3xl">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-[15px] leading-[1.7] text-muted sm:text-base">{children}</div>
    </section>
  );
}

export function AboutPage() {
  return (
    <div className="mx-auto max-w-[640px]">
      {/* Hero */}
      <div className="flex flex-col gap-3 text-center">
        <span className="text-sm font-medium tracking-wide text-muted uppercase">Historien bakom verktyget</span>
        <h1 className="text-3xl font-semibold text-text sm:text-4xl">Om DödsboGuiden</h1>
      </div>

      <div className="mt-16">
        <Section title="Varför det här finns">
          <p>
            DödsboGuiden skapades av Christos Mylonas efter att hans pappa gick bort. Det som saknades var inte
            information — den fanns överallt, spridd över myndigheter, banker och blanketter. Det som saknades
            var ett praktiskt verktyg som kunde hålla ihop allt: vad som skulle göras, i vilken ordning, och vad
            som faktiskt var klart.
          </p>
          <p>
            Han var envis. Han tackade nej till att lämna över allt till en jurist och bestämde sig för att göra
            det själv. Det gick — men det var överväldigande på ett sätt som är svårt att förklara för någon som
            inte varit där. Inte för att uppgifterna i sig var svåra, utan för att det inte fanns någon som helst
            överblick att luta sig mot mitt i sorgen.
          </p>
        </Section>

        <Section title="En kniv mellan två tankar">
          <p>
            Under processen levde två motsatta tankar sida vid sida. Den ena: <em>du behöver en expert för det
            här, det är för komplicerat att klara själv.</em> Den andra: <em>du klarar det här själv, det är bara
            administration.</em>
          </p>
          <p>
            Båda tankarna hade rätt. Komplexiteten är verklig — regelverket, blanketterna och tidsfristerna finns
            där oavsett hur man känner för dem. Men möjligheten att klara det själv finns också, om man bara får
            rätt struktur att hålla sig i. Det är i det spänningsfältet DödsboGuiden föddes.
          </p>
        </Section>

        <Section title="Vad är DödsboGuiden egentligen?">
          <p>
            DödsboGuiden är ett praktikerverktyg, inte juridisk rådgivning. Det ersätter inte en jurist och det
            fattar inga beslut åt dig — det reducerar komplexiteten i dödsboprocessen utan att förenkla bort det
            som faktiskt spelar roll.
          </p>
          <p>Det är kostnadsfritt för alla, eftersom det byggdes för att lösa ett problem — inte för att sälja en tjänst.</p>
        </Section>

        <Section title="Ordet 'överväldigande' är nyckeln">
          <p>
            Den som hanterar ett dödsbo bär ofta på en dubbel börda: sorgen över den som gått bort, och samtidigt
            en administrativ press som inte tar hänsyn till var man befinner sig känslomässigt. Den andra bördan
            går att göra något åt.
          </p>
          <p>
            DödsboGuiden kan inte ta bort sorgen. Men den kan reducera den administrativa bördan genom att
            konkretisera stegen — göra det osynliga synligt och det ohanterliga hanterbart, ett steg i taget.
          </p>
        </Section>

        <Section title="Hur det fungerar">
          <p>
            Du anger information om dödsboet, och systemet guidar dig steg för steg genom det som behöver göras —
            i rätt ordning, anpassat efter din situation.
          </p>
          <p>
            Du är fortfarande själv ansvarig för dödsboet. Det förändras inte. Men du är inte längre vilsen i
            processen. Och om du väljer att anlita en jurist längre fram, gör du det från en position av kunskap
            — inte panik.
          </p>
        </Section>

        <Section title="En sista tanke">
          <p>
            Många som anlitar en jurist gör det inte för att de måste, utan för att de aldrig förstod att de
            kunde ha klarat det själva. DödsboGuiden finns för att visa att processen — trots att den känns
            oöverskådlig i början — går att göra läsbar.
          </p>
          <p>Kunskap, inte rädsla, ska vara det som styr besluten kring ett dödsbo.</p>
        </Section>
      </div>

      <div className="mt-16 flex flex-col items-center gap-1 border-t border-border pt-10 pb-4 text-center">
        <Link
          to="/login"
          className="rounded-lg border border-border bg-surface px-6 py-2.5 text-sm font-medium text-text transition hover:border-primary hover:text-primary-dark"
        >
          Börja din dödsbo-process
        </Link>
      </div>
    </div>
  );
}
