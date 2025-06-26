import React from 'react';
import { ResourceType } from './types';

export const API_KEY = 'OSOegLs.PR2lwJ1dwCeje9vTj7FPOt3hvpYKtwKkhw';
export const BASE_URL = 'https://search.dip.bundestag.de/api/v1';

export const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
);

export const NewspaperIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2V4" /><path d="M4 6h12" /><path d="M4 12h12" /><path d="M4 18h12" /><path d="M10 6h4" /><path d="M10 12h4" /><path d="M10 18h4" /></svg>
);

export const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
);

export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

export const ZapIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);

export const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

interface ResourceConfig {
    label: string;
    icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
    filters: { name: string; label: string; type: 'text' | 'date' | 'textarea' | 'number' | 'select', options?: {value: string, label: string}[] }[];
}

export const RESOURCE_CONFIG: Record<ResourceType, ResourceConfig> = {
    [ResourceType.VORGANG]: {
        label: 'Vorgänge',
        icon: (props) => <FileTextIcon {...props} />,
        filters: [
            { name: 'f.titel', label: 'Titel', type: 'textarea' },
            { name: 'f.wahlperiode', label: 'Wahlperiode', type: 'number' },
            { name: 'f.vorgangstyp', label: 'Vorgangstyp', type: 'textarea' },
            { name: 'f.beratungsstand', label: 'Beratungsstand', type: 'textarea' },
            { name: 'f.initiative', label: 'Initiative (UND)', type: 'textarea' },
            { name: 'f.deskriptor', label: 'Deskriptor (UND)', type: 'textarea' },
            { name: 'f.sachgebiet', label: 'Sachgebiet (UND)', type: 'textarea' },
            { name: 'f.urheber', label: 'Urheber (UND)', type: 'textarea' },
            { name: 'f.ressort_fdf', label: 'Federf. Ressort (UND)', type: 'textarea' },
            { name: 'f.dokumentart', label: 'Dokumentart', type: 'select', options: [{value: '', label: 'Alle'}, {value: 'Drucksache', label: 'Drucksache'}, {value: 'Plenarprotokoll', label: 'Plenarprotokoll'}] },
            { name: 'f.datum.start', label: 'Datum (Start)', type: 'date' },
            { name: 'f.datum.end', label: 'Datum (Ende)', type: 'date' },
        ],
    },
    [ResourceType.DRUCKSACHE]: {
        label: 'Drucksachen',
        icon: (props) => <NewspaperIcon {...props} />,
        filters: [
            { name: 'f.titel', label: 'Titel', type: 'textarea' },
            { name: 'f.drucksachetyp', label: 'Drucksachentyp', type: 'text' },
            { name: 'f.dokumentnummer', label: 'Dokumentnummer', type: 'textarea' },
            { name: 'f.wahlperiode', label: 'Wahlperiode', type: 'number' },
            { name: 'f.urheber', label: 'Urheber (UND)', type: 'textarea' },
            { name: 'f.ressort_fdf', label: 'Federf. Ressort (UND)', type: 'textarea' },
            { name: 'f.datum.start', label: 'Datum (Start)', type: 'date' },
            { name: 'f.datum.end', label: 'Datum (Ende)', type: 'date' },
        ],
    },
     [ResourceType.DRUCKSACHE_TEXT]: {
        label: 'Drucksachen (Volltext)',
        icon: (props) => <NewspaperIcon {...props} />,
        filters: [
            { name: 'f.titel', label: 'Titel', type: 'textarea' },
            { name: 'f.drucksachetyp', label: 'Drucksachentyp', type: 'text' },
            { name: 'f.dokumentnummer', label: 'Dokumentnummer', type: 'textarea' },
            { name: 'f.wahlperiode', label: 'Wahlperiode', type: 'number' },
            { name: 'f.urheber', label: 'Urheber (UND)', type: 'textarea' },
            { name: 'f.ressort_fdf', label: 'Federf. Ressort (UND)', type: 'textarea' },
            { name: 'f.datum.start', label: 'Datum (Start)', type: 'date' },
            { name: 'f.datum.end', label: 'Datum (Ende)', type: 'date' },
        ],
    },
    [ResourceType.PLENARPROTOKOLL]: {
        label: 'Plenarprotokolle',
        icon: (props) => <BookOpenIcon {...props} />,
        filters: [
            { name: 'f.dokumentnummer', label: 'Dokumentnummer', type: 'textarea' },
            { name: 'f.wahlperiode', label: 'Wahlperiode', type: 'number' },
            { name: 'f.datum.start', label: 'Datum (Start)', type: 'date' },
            { name: 'f.datum.end', label: 'Datum (Ende)', type: 'date' },
        ],
    },
    [ResourceType.PLENARPROTOKOLL_TEXT]: {
        label: 'Plenarprotokolle (Volltext)',
        icon: (props) => <BookOpenIcon {...props} />,
        filters: [
            { name: 'f.dokumentnummer', label: 'Dokumentnummer', type: 'textarea' },
            { name: 'f.wahlperiode', label: 'Wahlperiode', type: 'number' },
            { name: 'f.datum.start', label: 'Datum (Start)', type: 'date' },
            { name: 'f.datum.end', label: 'Datum (Ende)', type: 'date' },
        ],
    },
    [ResourceType.AKTIVITAET]: {
        label: 'Aktivitäten',
        icon: (props) => <ZapIcon {...props} />,
        filters: [
            { name: 'f.person', label: 'Person (Name)', type: 'textarea' },
            { name: 'f.person_id', label: 'Person (ID)', type: 'number' },
            { name: 'f.wahlperiode', label: 'Wahlperiode', type: 'number' },
            { name: 'f.deskriptor', label: 'Deskriptor (UND)', type: 'textarea' },
            { name: 'f.dokumentart', label: 'Dokumentart', type: 'select', options: [{value: '', label: 'Alle'}, {value: 'Drucksache', label: 'Drucksache'}, {value: 'Plenarprotokoll', label: 'Plenarprotokoll'}] },
            { name: 'f.datum.start', label: 'Datum (Start)', type: 'date' },
            { name: 'f.datum.end', label: 'Datum (Ende)', type: 'date' },
        ],
    },
    [ResourceType.PERSON]: {
        label: 'Personen',
        icon: (props) => <UsersIcon {...props} />,
        filters: [
            { name: 'f.person', label: 'Name', type: 'textarea' },
            { name: 'f.wahlperiode', label: 'Wahlperiode', type: 'number' },
            { name: 'f.datum.start', label: 'Datum (Start)', type: 'date' },
            { name: 'f.datum.end', label: 'Datum (Ende)', type: 'date' },
        ],
    },
};
