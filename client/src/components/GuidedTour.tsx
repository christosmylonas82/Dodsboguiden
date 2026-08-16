import { useEffect } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

const SECONDARY = { classes: 'shepherd-button-secondary' };

export function GuidedTour({ isOpen, onFinish }: { isOpen: boolean; onFinish: () => void }) {
  useEffect(() => {
    if (!isOpen) return;

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'dodsbo-shepherd',
        scrollTo: true,
        cancelIcon: { enabled: true },
      },
    });

    tour.addStep({
      id: 'welcome',
      title: 'Välkommen till Dödsbo Guide!',
      text: 'Denna guidade tur visar dig de viktigaste funktionerna i appen. Du kan hoppa över när som helst.',
      buttons: [
        { text: 'Hoppa över', action: () => tour.cancel(), ...SECONDARY },
        { text: 'Börja', action: () => tour.next() },
      ],
    });

    tour.addStep({
      id: 'phases',
      title: 'De 5 faserna',
      text: 'Din dödsbohantering är indelad i 5 faser: Direkt efter dödsfall, Begravning, Inför bouppteckning, Under bouppteckning, och Avslut & arvskifte. Varje fas har en egen checklista med uppgifter.',
      attachTo: { element: '[data-tour="phases"]', on: 'top' },
      buttons: [
        { text: 'Tillbaka', action: () => tour.back(), ...SECONDARY },
        { text: 'Nästa', action: () => tour.next() },
      ],
    });

    tour.addStep({
      id: 'progress',
      title: 'Framsteg',
      text: 'Här ser du hur långt ni har kommit totalt. Klicka för en detaljerad översikt per fas.',
      attachTo: { element: '[data-tour="progress"]', on: 'bottom' },
      buttons: [
        { text: 'Tillbaka', action: () => tour.back(), ...SECONDARY },
        { text: 'Nästa', action: () => tour.next() },
      ],
    });

    tour.addStep({
      id: 'members',
      title: 'Familjemedlemmar',
      text: 'Bjud in andra familjemedlemmar för att arbeta tillsammans. Alla kan se framsteg och uppgifter.',
      attachTo: { element: '[data-tour="members"]', on: 'bottom' },
      buttons: [
        { text: 'Tillbaka', action: () => tour.back(), ...SECONDARY },
        { text: 'Nästa', action: () => tour.next() },
      ],
    });

    tour.addStep({
      id: 'activity',
      title: 'Aktivitetslogg',
      text: 'Här ser du all aktivitet i dödsboet – vem som gjorde vad och när. Det hjälper familjen att hålla sig uppdaterad.',
      attachTo: { element: '[data-tour="activity"]', on: 'bottom' },
      buttons: [
        { text: 'Tillbaka', action: () => tour.back(), ...SECONDARY },
        { text: 'Nästa', action: () => tour.next() },
      ],
    });

    tour.addStep({
      id: 'contacts',
      title: 'Kontaktlista',
      text: 'Spara alla viktiga kontakter här – begravningsbyrå, advokat, banker, försäkringsbolag och andra.',
      attachTo: { element: '[data-tour="contacts"]', on: 'bottom' },
      buttons: [
        { text: 'Tillbaka', action: () => tour.back(), ...SECONDARY },
        { text: 'Nästa', action: () => tour.next() },
      ],
    });

    tour.addStep({
      id: 'inventory',
      title: 'Inventarielista',
      text: 'Dokumentera alla tillgångar och skulder här. Det behövs för bouppteckningen.',
      attachTo: { element: '[data-tour="inventory"]', on: 'bottom' },
      buttons: [
        { text: 'Tillbaka', action: () => tour.back(), ...SECONDARY },
        { text: 'Nästa', action: () => tour.next() },
      ],
    });

    tour.addStep({
      id: 'settings',
      title: 'Inställningar',
      text: 'Hantera din profil, ändra lösenord och andra inställningar här.',
      attachTo: { element: '[data-tour="settings"]', on: 'bottom' },
      buttons: [
        { text: 'Tillbaka', action: () => tour.back(), ...SECONDARY },
        { text: 'Klar!', action: () => tour.complete() },
      ],
    });

    let finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      onFinish();
    }
    tour.on('cancel', finish);
    tour.on('complete', finish);

    tour.start();

    return () => {
      if (!finished) tour.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return null;
}
