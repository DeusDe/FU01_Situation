// Darstellung: baut die Oberfläche im DOM auf.
// Die Funktionen kennen keinen globalen Zustand; Aktionen kommen als Callbacks von außen.

import { WOCHENTAGE, datumsschluessel, formatKurz, formatVoll, tageDerWoche } from './datum.js';
import { summeStunden } from './speicher.js';
import { MAX_STUNDEN_PRO_TAG, taetigkeitPruefen } from './validierung.js';

const wocheNav = document.getElementById('woche-nav');
const ansichtTitel = document.getElementById('ansicht-titel');
const stundenSumme = document.getElementById('stunden-summe');
const ansicht = document.getElementById('ansicht');

/** Kurzschreibweise zum Erzeugen eines Elements (Text wird als Text gesetzt, nicht als HTML). */
function erzeugeElement(tag, klasse, text) {
    const element = document.createElement(tag);
    if (klasse) element.className = klasse;
    if (text !== undefined) element.textContent = text;
    return element;
}

/** Wochenleiste (mobil horizontal, ab md als Sidebar). */
export function wochenleisteRendern(gewaehlterTag, beiAuswahl) {
    wocheNav.replaceChildren(...tageDerWoche(gewaehlterTag).map(tag => {
        const aktiv = datumsschluessel(tag) === datumsschluessel(gewaehlterTag);
        const knopf = erzeugeElement('button', `nav-link flex-shrink-0 ${aktiv ? 'active' : ''}`);
        knopf.type = 'button';
        if (aktiv) knopf.setAttribute('aria-current', 'true');
        knopf.append(`${WOCHENTAGE[tag.getDay()]}. ${formatKurz(tag)}`);
        // Das Jahr wird erst ab Tablet-Breite angezeigt, mobil fehlt der Platz
        knopf.append(erzeugeElement('span', 'd-none d-md-inline', String(tag.getFullYear())));
        knopf.addEventListener('click', () => beiAuswahl(tag));
        return knopf;
    }));
}

/** Titelzeile über dem Hauptbereich: Überschrift links, Stundensumme rechts. */
function kopfzeileRendern(titel, tag, taetigkeiten) {
    ansichtTitel.textContent = `${titel} - ${formatVoll(tag)}`;
    stundenSumme.textContent = `${summeStunden(taetigkeiten)}/${MAX_STUNDEN_PRO_TAG} h`;
}

/** Button "Tätigkeit hinzufügen": mobil volle Breite, ab Tablet zentriert. */
function hinzufuegenKnopf(beiHinzufuegen) {
    const huelle = erzeugeElement('div', 'd-grid d-md-flex justify-content-md-center mt-3');
    const knopf = erzeugeElement('button', 'btn btn-secondary px-md-5', 'Tätigkeit hinzufügen');
    knopf.type = 'button';
    knopf.addEventListener('click', beiHinzufuegen);
    huelle.append(knopf);
    return huelle;
}

/** Tagesansicht: Leerzustand oder Liste der Tätigkeiten. */
export function tagRendern(tag, taetigkeiten, beiHinzufuegen) {
    kopfzeileRendern('Tagesansicht', tag, taetigkeiten);

    if (taetigkeiten.length === 0) {
        const leer = erzeugeElement('div', 'text-center py-5');
        leer.append(
            erzeugeElement('p', 'fw-bold mb-1', 'Noch keine Tätigkeiten'),
            erzeugeElement('p', 'mb-0', 'Trage ein, was du heute gemacht hast.'),
            hinzufuegenKnopf(beiHinzufuegen)
        );
        ansicht.replaceChildren(leer);
        return;
    }

    const liste = erzeugeElement('ul', 'list-unstyled d-grid gap-3 mb-0');
    taetigkeiten.forEach(taetigkeit => {
        const eintrag = erzeugeElement('li', 'eintrag d-flex justify-content-between gap-3');
        eintrag.append(
            erzeugeElement('span', 'eintrag-text', taetigkeit.text),
            erzeugeElement('span', 'text-nowrap', `${taetigkeit.stunden} h`)
        );
        liste.append(eintrag);
    });
    ansicht.replaceChildren(liste, hinzufuegenKnopf(beiHinzufuegen));
}

/** Formular "Neue Tätigkeit" inklusive Validierung und Fehlermeldungen. */
export function formularRendern(tag, taetigkeiten, beiSpeichern, beiAbbrechen) {
    kopfzeileRendern('Neue Tätigkeit', tag, taetigkeiten);

    const formular = erzeugeElement('form', 'd-grid gap-3');
    // Eigene Fehlermeldungen statt der Browser-Standardmeldungen
    formular.noValidate = true;
    formular.innerHTML = `
        <div>
            <label for="taetigkeit-text" class="form-label">Tätigkeit</label>
            <textarea id="taetigkeit-text" class="form-control rounded-4" rows="4"></textarea>
            <div class="invalid-feedback text-end">Text fehlt. Ergänze eine Beschreibung</div>
        </div>
        <div>
            <label for="taetigkeit-stunden" class="form-label">Stunden</label>
            <input id="taetigkeit-stunden" class="form-control" type="number" inputmode="numeric" min="1" step="1">
            <div class="invalid-feedback" id="stunden-fehler"></div>
        </div>
        <div class="d-flex gap-2">
            <button type="submit" class="btn btn-secondary">Speichern</button>
            <button type="button" class="btn btn-outline-light" id="taetigkeit-abbrechen">Abbrechen</button>
        </div>`;

    const textFeld = formular.querySelector('#taetigkeit-text');
    const stundenFeld = formular.querySelector('#taetigkeit-stunden');
    const stundenMeldung = formular.querySelector('#stunden-fehler');

    // Stundenfeld schmal und die Fehlermeldung daneben statt darunter
    stundenFeld.style.maxWidth = '8rem';
    stundenFeld.parentElement.classList.add('d-flex', 'flex-wrap', 'align-items-center', 'column-gap-3');
    stundenFeld.parentElement.firstElementChild.classList.add('w-100');
    stundenMeldung.classList.add('w-auto', 'mt-0');

    formular.querySelector('#taetigkeit-abbrechen').addEventListener('click', beiAbbrechen);

    formular.addEventListener('submit', ereignis => {
        ereignis.preventDefault();
        const text = textFeld.value.trim();
        const stunden = Number(stundenFeld.value);
        const { textFehler, stundenFehler } = taetigkeitPruefen(text, stunden, taetigkeiten);

        // Fehlerzustand für beide Felder setzen bzw. zurücknehmen
        textFeld.classList.toggle('is-invalid', textFehler);
        stundenFeld.classList.toggle('is-invalid', Boolean(stundenFehler));
        stundenMeldung.textContent = stundenFehler;
        stundenMeldung.classList.toggle('d-block', Boolean(stundenFehler));
        if (textFehler || stundenFehler) return;

        beiSpeichern({ id: crypto.randomUUID?.() ?? String(Date.now()), text, stunden });
    });

    ansicht.replaceChildren(formular);
    textFeld.focus();
}
