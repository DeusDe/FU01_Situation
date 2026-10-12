// Hilfsfunktionen rund um Datum und Wochentage

// Index entspricht Date.getDay(): 0 = Sonntag
export const WOCHENTAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

/** Eindeutiger Schlüssel pro Tag (z. B. "2026-10-05"), dient als Speicher-Schlüssel. */
export function datumsschluessel(datum) {
    const monat = String(datum.getMonth() + 1).padStart(2, '0');
    const tag = String(datum.getDate()).padStart(2, '0');
    return `${datum.getFullYear()}-${monat}-${tag}`;
}

/** Kurzform ohne Jahr, z. B. "5.10." */
export function formatKurz(datum) {
    return `${datum.getDate()}.${datum.getMonth() + 1}.`;
}

/** Vollständiges Datum, z. B. "5.10.2026" */
export function formatVoll(datum) {
    return `${formatKurz(datum)}${datum.getFullYear()}`;
}

/** Montag bis Freitag der Woche, in der `datum` liegt. */
export function tageDerWoche(datum) {
    // Date.getDay() beginnt sonntags (0); so wird der Montag zum Wochenanfang
    const montag = new Date(datum);
    montag.setDate(datum.getDate() - ((datum.getDay() + 6) % 7));
    return Array.from({ length: 5 }, (_, i) => {
        const tag = new Date(montag);
        tag.setDate(montag.getDate() + i);
        return tag;
    });
}
