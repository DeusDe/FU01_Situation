// Validierungsregeln für eine neue Tätigkeit (reine Logik, ohne DOM)

import { summeStunden } from './speicher.js';

export const MAX_STUNDEN_PRO_TAG = 8;

/**
 * Prüft Text und Stunden gegen die bereits vorhandenen Tätigkeiten des Tages.
 * Gibt zurück: { textFehler: boolean, stundenFehler: string }.
 * Ein leerer `stundenFehler` bedeutet: Stunden sind gültig.
 */
export function taetigkeitPruefen(text, stunden, vorhandene) {
    const uebrig = MAX_STUNDEN_PRO_TAG - summeStunden(vorhandene);

    let stundenFehler = '';
    if (!Number.isInteger(stunden) || stunden < 1) {
        stundenFehler = 'Bitte ganze Stunden angeben';
    } else if (stunden > uebrig) {
        stundenFehler = `Maximal ${MAX_STUNDEN_PRO_TAG} Stunden am Tag`;
    }

    return { textFehler: text === '', stundenFehler };
}
