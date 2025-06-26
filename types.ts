
export enum ResourceType {
  VORGANG = 'vorgang',
  DRUCKSACHE = 'drucksache',
  DRUCKSACHE_TEXT = 'drucksache-text',
  PLENARPROTOKOLL = 'plenarprotokoll',
  PLENARPROTOKOLL_TEXT = 'plenarprotokoll-text',
  AKTIVITAET = 'aktivitaet',
  PERSON = 'person',
}

export interface ListResponse<T> {
  numFound: number;
  cursor: string;
  documents: T[];
}

export interface Deskriptor {
  name: string;
  typ: string;
  fundstelle?: boolean;
}

export interface Fundstelle {
  id: string;
  dokumentart: string;
  pdf_url?: string;
  xml_url?: string;
  dokumentnummer: string;
  datum: string;
  drucksachetyp?: string;
  herausgeber: string;
  urheber: string[];
  verteildatum?: string;
  seite?: string;
  anfangsseite?: number;
  endseite?: number;
  anlagen?: string;
}

export interface Urheber {
    einbringer?: boolean;
    bezeichnung: string;
    titel: string;
    rolle?: string;
}

export interface Verkuendung {
    jahrgang: string;
    heftnummer?: string;
    seite: string;
    ausfertigungsdatum: string;
    verkuendungsdatum: string;
    fundstelle: string;
    pdf_url?: string;
    titel?: string;
    einleitungstext: string;
}

export interface Inkrafttreten {
    datum: string;
    erlaeuterung?: string;
}

export interface VorgangVerlinkung {
    id: string;
    verweisung: string;
    titel: string;
    wahlperiode: number;
    gesta?: string;
}

export interface Vorgangsbezug {
    id: string;
    titel: string;
    vorgangstyp: string;
}

export interface Ressort {
    federfuehrend: boolean;
    titel: string;
}

export interface BaseDocument {
  id: string;
  typ: string;
  wahlperiode: number | number[];
  datum: string;
  aktualisiert: string;
  titel: string;
  abstract?: string;
}

export interface Vorgang extends BaseDocument {
  typ: 'Vorgang';
  beratungsstand?: string;
  vorgangstyp: string;
  initiative?: string[];
  sachgebiet?: string[];
  deskriptor?: Deskriptor[];
  gesta?: string;
  zustimmungsbeduerftigkeit?: string[];
  verkuendung?: Verkuendung[];
  inkrafttreten?: Inkrafttreten[];
  vorgang_verlinkung?: VorgangVerlinkung[];
}

export interface Drucksache extends BaseDocument {
  typ: 'Dokument';
  dokumentart: 'Drucksache';
  drucksachetyp: string;
  dokumentnummer: string;
  herausgeber: string;
  fundstelle: Fundstelle;
  urheber?: Urheber[];
  vorgangsbezug?: Vorgangsbezug[];
  vorgangsbezug_anzahl?: number;
  ressort?: Ressort[];
  text?: string; // for drucksache-text
  anlagen?: string;
}

export interface Plenarprotokoll extends BaseDocument {
  typ: 'Dokument';
  dokumentart: 'Plenarprotokoll';
  dokumentnummer: string;
  herausgeber: string;
  fundstelle: Fundstelle;
  vorgangsbezug?: Vorgangsbezug[];
  vorgangsbezug_anzahl?: number;
  sitzungsbemerkung?: string;
  text?: string; // for plenarprotokoll-text
}

export interface Aktivitaet extends BaseDocument {
  typ: 'Aktivität';
  aktivitaetsart: string;
  dokumentart: 'Drucksache' | 'Plenarprotokoll';
  person_id: string;
  fundstelle: Fundstelle;
  vorgangsbezug?: Vorgangsbezug[];
  vorgangsbezug_anzahl?: number;
  deskriptor?: Deskriptor[];
}

export interface Person extends BaseDocument {
  typ: 'Person';
  nachname: string;
  vorname: string;
  namenszusatz?: string;
  funktion: string;
  fraktion?: string;
  ressort?: string;
  bundesland?: string;
}

export interface GeminiSearchResult {
  resourceType: ResourceType;
  filters: Record<string, any>;
}

export type AnyDocument = Vorgang | Drucksache | Plenarprotokoll | Aktivitaet | Person;
