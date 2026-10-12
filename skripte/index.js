// Einstiegspunkt: hält den Zustand (gewählter Tag) und verbindet Speicher und Ansichten.

import { taetigkeitenFuer, taetigkeitHinzufuegen } from './speicher.js';
import { wochenleisteRendern, tagRendern, formularRendern } from './ansichten.js';

// Gewählter Tag; beim Start ist es heute
let gewaehlterTag = new Date();

/** Zeigt Wochenleiste und Tagesansicht für den gewählten Tag. */
function tagAnzeigen() {
    wochenleisteRendern(gewaehlterTag, tag => {
        gewaehlterTag = tag;
        tagAnzeigen();
    });
    tagRendern(gewaehlterTag, taetigkeitenFuer(gewaehlterTag), formularAnzeigen);
}

/** Zeigt das Formular für eine neue Tätigkeit am gewählten Tag. */
function formularAnzeigen() {
    formularRendern(
        gewaehlterTag,
        taetigkeitenFuer(gewaehlterTag),
        taetigkeit => {
            taetigkeitHinzufuegen(gewaehlterTag, taetigkeit);
            tagAnzeigen();
        },
        tagAnzeigen
    );
}

tagAnzeigen();
