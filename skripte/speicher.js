// Speicherung der Tätigkeiten im localStorage des Browsers.
// Struktur: { "2026-10-05": [{ id, text, stunden }, ...], ... }

import { datumsschluessel } from './datum.js';

const SPEICHER_SCHLUESSEL = 'berichtsheft_taetigkeiten';

/** Liest alle gespeicherten Tage; bei fehlenden oder defekten Daten ein leeres Objekt. */
function alleLaden() {
    try {
        return JSON.parse(localStorage.getItem(SPEICHER_SCHLUESSEL)) || {};
    } catch {
        return {};
    }
}

function alleSpeichern(daten) {
    try {
        localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(daten));
    } catch {
        // Speicher nicht verfügbar (z. B. privater Modus): Eintrag geht verloren
    }
}

/** Alle Tätigkeiten eines Tages. */
export function taetigkeitenFuer(datum) {
    return alleLaden()[datumsschluessel(datum)] || [];
}

/** Hängt eine Tätigkeit an den Tag an. */
export function taetigkeitHinzufuegen(datum, taetigkeit) {
    const daten = alleLaden();
    const schluessel = datumsschluessel(datum);
    daten[schluessel] = [...(daten[schluessel] || []), taetigkeit];
    alleSpeichern(daten);
}

/** Summe der Stunden einer Liste von Tätigkeiten. */
export function summeStunden(taetigkeiten) {
    return taetigkeiten.reduce((summe, t) => summe + t.stunden, 0);
}
