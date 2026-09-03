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
      title: 'Välkommen till Dödsbo Guiden!',
      text: 'Vi är glada att du är här — den här typen av arbete kan kännas tungt, men du behöver inte göra det ensam. Denna guidade tur visar dig de viktigaste funktionerna i appen. Du kan hoppa över när som helst.',
      buttons: [
        { text: 'Hoppa över', action: () => tour.cancel(), ...SECONDARY },
        { text: 'Börja', action: () => tour.next() },
      ],
    });

    tour.addStep({
      id: 'phases',
      title: 'De 5 faserna',
      text: 'Din dödsbohantering är indelad i 5 faser: Direkt efter dödsfall, Begravning, Inför bouppteckning, Under bouppteckning, och Avslut & arvskifte. Varje fas har en egen checklista med uppgifter. Under "Under bouppteckning" hittar ni även en Boupptecknings-guide med bland annat ett steg för att hålla bouppteckningsförrättningen (mötet). I "Inför bouppteckning" kan ni även kryssa i om dödsboet är mer komplext (t.ex. företag, samägande, utlandstillgångar) för att få fler relevanta uppgifter i checklistan.',
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
      title: 'Senaste aktivitet',
      text: 'Här ser du vad som senast hänt i dödsboet – vem som gjorde vad och när. Klicka för hela aktivitetsloggen.',
      attachTo: { element: '[data-tour="activity"]', on: 'bottom' },
      buttons: [
        { text: 'Tillbaka', action: () => tour.back(), ...SECONDARY },
        { text: 'Nästa', action: () => tour.next() },
      ],
    });

    tour.addStep({
      id: 'edit-name',
      title: 'Redigera dödsbo',
      text: 'Klicka på pennan för att ändra den avlidnes namn eller dödsdatum.',
      attachTo: { element: '[data-tour="edit-name"]', on: 'bottom' },
      buttons: [
        { text: 'Tillbaka', action: () => tour.back(), ...SECONDARY },
        { text: 'Nästa', action: () => tour.next() },
      ],
    });

    tour.addStep({
      id: 'contacts',
      title: 'Kontaktlista',
      text: 'Spara alla viktiga kontakter här – begravningsbyrå, advokat, banker, försäkringsbolag och andra. Ni kan nu redigera en kontakt direkt i listan, utan att öppna ett separat formulär. Använd knappen "Exportera" längst upp för att spara listan som PDF eller Word.',
      attachTo: { element: '[data-tour="contacts"]', on: 'bottom' },
      buttons: [
        { text: 'Tillbaka', action: () => tour.back(), ...SECONDARY },
        { text: 'Nästa', action: () => tour.next() },
      ],
    });

    tour.addStep({
      id: 'inventory',
      title: 'Inventarielista',
      text: 'Dokumentera alla tillgångar och skulder här. Det behövs för bouppteckningen. Precis som i kontaktlistan går raderna att redigera direkt.',
      attachTo: { element: '[data-tour="inventory"]', on: 'bottom' },
      buttons: [
        { text: 'Tillbaka', action: () => tour.back(), ...SECONDARY },
        { text: 'Nästa', action: () => tour.next() },
      ],
    });

    tour.addStep({
      id: 'documents',
      title: 'Dokument',
      text: 'Ladda upp och samla viktiga dokument som dödsfallsintyg, bouppteckning och avtal på ett ställe.',
      attachTo: { element: '[data-tour="documents"]', on: 'bottom' },
      buttons: [
        { text: 'Tillbaka', action: () => tour.back(), ...SECONDARY },
        { text: 'Nästa', action: () => tour.next() },
      ],
    });

    tour.addStep({
      id: 'transactions',
      title: 'Ekonomi',
      text: 'Håll koll på dödsboets kostnader och intäkter, t.ex. begravningskostnader och räkningar. Även här kan ni redigera poster direkt i listan.',
      attachTo: { element: '[data-tour="transactions"]', on: 'bottom' },
      buttons: [
        { text: 'Tillbaka', action: () => tour.back(), ...SECONDARY },
        { text: 'Nästa', action: () => tour.next() },
      ],
    });

    tour.addStep({
      id: 'contactRegistry',
      title: 'Myndigheter & företag',
      text: 'Här hittar ni färdiga kontaktuppgifter till myndigheter, banker och andra företag som ofta behöver kontaktas vid ett dödsfall.',
      attachTo: { element: '[data-tour="contactRegistry"]', on: 'bottom' },
      buttons: [
        { text: 'Tillbaka', action: () => tour.back(), ...SECONDARY },
        { text: 'Nästa', action: () => tour.next() },
      ],
    });

    tour.addStep({
      id: 'theme',
      title: 'Ljust eller mörkt tema',
      text: 'Byt mellan ljust och mörkt tema efter tycke och smak.',
      attachTo: { element: '[data-tour="theme"]', on: 'bottom' },
      buttons: [
        { text: 'Tillbaka', action: () => tour.back(), ...SECONDARY },
        { text: 'Nästa', action: () => tour.next() },
      ],
    });

    tour.addStep({
      id: 'notifications',
      title: 'Notiser',
      text: 'Här får ni notiser när något viktigt händer, t.ex. när en uppgift tilldelas eller markeras klar.',
      attachTo: { element: '[data-tour="notifications"]', on: 'bottom' },
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
