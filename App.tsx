import React, { useState, useCallback } from 'react';
import { AnyDocument, ResourceType, Fundstelle, Deskriptor, Verkuendung, Urheber, Vorgangsbezug, Ressort, Drucksache, Plenarprotokoll, Person, Vorgang, Aktivitaet, GeminiSearchResult, Inkrafttreten, VorgangVerlinkung } from './types';
import { RESOURCE_CONFIG, BookOpenIcon, NewspaperIcon, FileTextIcon, UsersIcon, ZapIcon, SearchIcon } from './constants';
import { fetchDocuments } from './services/api';
import { generateSearchParameters } from './services/gemini';

// UI Components

const Spinner: React.FC<{ small?: boolean}> = ({ small = false }) => (
    <div className={`flex justify-center items-center ${small ? 'p-0' : 'p-8'}`}>
        <div className={`${small ? 'w-6 h-6 border-2' : 'w-12 h-12 border-4'} border-primary-500 border-t-transparent rounded-full animate-spin`}></div>
    </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="p-4 my-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg">
        <p className="font-bold">Fehler</p>
        <p>{message}</p>
    </div>
);

const Tag: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <span className={`inline-block bg-primary-800/80 text-primary-200 text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>
        {children}
    </span>
);

const InitialState: React.FC = () => (
    <div className="text-center py-16 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Willkommen beim DIP Explorer</h2>
        <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Starten Sie Ihre Recherche in den Dokumenten des Deutschen Bundestages.
            Nutzen Sie die intelligente Suche oben, um eine Anfrage in natürlicher Sprache zu stellen,
            oder verwenden Sie die manuellen Filter auf der linken Seite für eine detaillierte Suche.
        </p>
        <div className="flex justify-center items-center gap-4 text-slate-300">
            <FileTextIcon className="w-8 h-8"/>
            <NewspaperIcon className="w-8 h-8"/>
            <BookOpenIcon className="w-8 h-8"/>
            <UsersIcon className="w-8 h-8"/>
        </div>
    </div>
);

const NoResults: React.FC = () => (
    <div className="text-center py-16 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Keine Ergebnisse</h2>
        <p className="text-slate-400">Ihre Suche ergab keine Treffer. Bitte versuchen Sie es mit anderen Filtern.</p>
    </div>
);

// Filter Panel Components
interface FilterPanelProps {
    activeResource: ResourceType;
    filters: Record<string, any>;
    onFilterChange: (name: string, value: string) => void;
    onSearch: () => void;
    isLoading: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ activeResource, filters, onFilterChange, onSearch, isLoading }) => {
    const config = RESOURCE_CONFIG[activeResource];

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onFilterChange(e.target.name, e.target.value);
    };

    const renderFilterInput = (filter: typeof config.filters[0]) => {
        const value = filters[filter.name] || '';
        switch (filter.type) {
            case 'textarea':
                return (
                    <textarea
                        name={filter.name}
                        value={value}
                        onChange={handleTextareaChange}
                        placeholder="Ein Wert pro Zeile"
                        className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        rows={3}
                    />
                );
            case 'select':
                 return (
                    <select
                        name={filter.name}
                        value={value}
                        onChange={(e) => onFilterChange(e.target.name, e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    >
                        {filter.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                );
            default:
                return (
                    <input
                        type={filter.type}
                        name={filter.name}
                        value={value}
                        onChange={(e) => onFilterChange(e.target.name, e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    />
                );
        }
    };

    return (
        <div className="p-4 bg-slate-900 lg:bg-slate-800/50 rounded-lg lg:h-full lg:overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-100 mb-4">Manuelle Filter</h3>
            <div className="space-y-4">
                {config.filters.map(filter => (
                    <div key={filter.name}>
                        <label className="block text-sm font-medium text-slate-300 mb-1">{filter.label}</label>
                        {renderFilterInput(filter)}
                    </div>
                ))}
                <button
                    onClick={onSearch}
                    disabled={isLoading}
                    className="w-full bg-primary-600 text-white font-bold py-2 px-4 rounded-md hover:bg-primary-700 transition duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? <Spinner small /> : 'Suchen'}
                </button>
            </div>
        </div>
    );
};


// Result Components
interface DocumentCardProps {
    doc: AnyDocument;
    onSelect: (doc: AnyDocument) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onSelect }) => {
    const getIcon = () => {
        switch (doc.typ) {
            case 'Vorgang': return <FileTextIcon className="w-5 h-5 text-primary-400" />;
            case 'Aktivität': return <ZapIcon className="w-5 h-5 text-primary-400" />;
            case 'Person': return <UsersIcon className="w-5 h-5 text-primary-400" />;
            case 'Dokument':
                if (doc.dokumentart === 'Drucksache') return <NewspaperIcon className="w-5 h-5 text-primary-400" />;
                if (doc.dokumentart === 'Plenarprotokoll') return <BookOpenIcon className="w-5 h-5 text-primary-400" />;
                break;
        }
        return <FileTextIcon className="w-5 h-5 text-primary-400" />;
    };

    return (
        <div 
            className="bg-slate-800/80 p-4 rounded-lg shadow-md hover:bg-slate-700/80 transition duration-200 cursor-pointer border border-slate-700"
            onClick={() => onSelect(doc)}
        >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{getIcon()}</div>
                <div className="flex-grow">
                    <h3 className="font-bold text-slate-100 text-lg leading-tight">{doc.titel}</h3>
                    <p className="text-sm text-slate-400 mt-1">
                        {doc.typ === 'Vorgang' && `Vorgangstyp: ${(doc as Vorgang).vorgangstyp}`}
                        {doc.typ === 'Dokument' && doc.dokumentart === 'Drucksache' && `Dokument: ${(doc as Drucksache).drucksachetyp} ${(doc as Drucksache).dokumentnummer}`}
                        {doc.typ === 'Dokument' && doc.dokumentart === 'Plenarprotokoll' && `Protokoll: ${(doc as Plenarprotokoll).dokumentnummer}`}
                        {doc.typ === 'Aktivität' && `Aktivität: ${(doc as Aktivitaet).aktivitaetsart}`}
                        {doc.typ === 'Person' && `Person: ${(doc as Person).vorname} ${(doc as Person).nachname}`}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <Tag>ID: {doc.id}</Tag>
                        {Array.isArray(doc.wahlperiode) ?
                             doc.wahlperiode.map(wp => <Tag key={wp}>WP: {wp}</Tag>) :
                             <Tag>WP: {doc.wahlperiode}</Tag>
                        }
                        <Tag>Datum: {new Date(doc.datum).toLocaleDateString('de-DE')}</Tag>
                        {('beratungsstand' in doc && doc.beratungsstand) && <Tag className="bg-green-800/80 text-green-200">{doc.beratungsstand}</Tag>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modal Components

const DetailSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`py-3 ${className}`}>
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</h4>
        <div className="text-slate-200 space-y-2">{children}</div>
    </div>
);

const DocumentDetailModal: React.FC<{ doc: AnyDocument | null; onClose: () => void }> = ({ doc, onClose }) => {
    if (!doc) return null;

    const renderList = (items: string[] | undefined) => !items || items.length === 0 ? <p className="text-slate-500">N/A</p> : (
        <ul className="list-disc list-inside space-y-1">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
    );
    
    const renderDescriptors = (items: Deskriptor[] | undefined) => !items || items.length === 0 ? <p className="text-slate-500">N/A</p> : (
         <div className="flex flex-wrap gap-2">{items.map((d, i) => <Tag key={i} className={d.fundstelle ? 'border border-primary-400' : ''}>{d.name}</Tag>)}</div>
    );

    const renderFundstelle = (f: Fundstelle | undefined) => f && (
        <div className="text-sm space-y-1 p-3 bg-slate-900/50 rounded-md">
            <p><strong>Dokument:</strong> {f.dokumentart} {f.dokumentnummer}</p>
            <p><strong>Herausgeber:</strong> {f.herausgeber}</p>
            {f.pdf_url && <a href={f.pdf_url} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">PDF ansehen</a>}
        </div>
    );

    const renderVerkuendung = (items: Verkuendung[] | undefined) => !items || items.length === 0 ? <p className="text-slate-500">N/A</p> : items.map((v, i) => (
        <div key={i} className="text-sm space-y-1 p-3 bg-slate-900/50 rounded-md mt-2">
            <p><strong>"{v.einleitungstext}"</strong> {v.titel || ''}</p>
            <p><strong>Fundstelle:</strong> {v.fundstelle}</p>
            <p><strong>Verkündungsdatum:</strong> {new Date(v.verkuendungsdatum).toLocaleDateString('de-DE')}</p>
            {v.pdf_url && <a href={v.pdf_url} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">Im Bundesgesetzblatt ansehen</a>}
        </div>
    ));
    
    const renderUrheber = (items: Urheber[] | undefined) => !items || items.length === 0 ? <p className="text-slate-500">N/A</p> : <ul className="list-disc list-inside">{items.map((u, i) => <li key={i}>{u.titel} ({u.bezeichnung})</li>)}</ul>;
    const renderVorgangsbezug = (items: Vorgangsbezug[] | undefined) => !items || items.length === 0 ? <p className="text-slate-500">N/A</p> : <ul className="list-disc list-inside">{items.map((u, i) => <li key={i}>{u.titel} ({u.vorgangstyp})</li>)}</ul>;
    const renderRessort = (items: Ressort[] | undefined) => !items || items.length === 0 ? <p className="text-slate-500">N/A</p> : <ul className="list-disc list-inside">{items.map((u, i) => <li key={i}>{u.titel} {u.federfuehrend && <Tag className="ml-2">federführend</Tag>}</li>)}</ul>;
    const renderInkrafttreten = (items: Inkrafttreten[] | undefined) => !items || items.length === 0 ? <p className="text-slate-500">N/A</p> : items.map((item, i) => (
        <p key={i}>{new Date(item.datum).toLocaleDateString('de-DE')} {item.erlaeuterung && `(${item.erlaeuterung})`}</p>
    ));
     const renderVerlinkungen = (items: VorgangVerlinkung[] | undefined) => !items || items.length === 0 ? <p className="text-slate-500">N/A</p> : <ul className="list-disc list-inside space-y-2">{items.map((v, i) => <li key={i}><strong>{v.verweisung}:</strong> {v.titel} (ID: {v.id}, WP: {v.wahlperiode})</li>)}</ul>;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700" 
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-100 flex-grow pr-4">{doc.titel}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl font-light leading-none flex-shrink-0">×</button>
                </header>
                <main className="p-6 overflow-y-auto space-y-4">
                    {doc.abstract && <DetailSection title="Abstract" className="text-slate-300 italic">{doc.abstract}</DetailSection>}
                    {'text' in doc && doc.text && <DetailSection title="Volltext"><pre className="whitespace-pre-wrap font-sans text-sm">{doc.text}</pre></DetailSection>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <DetailSection title="Typ">{doc.typ} { 'dokumentart' in doc && `(${doc.dokumentart})` }</DetailSection>
                        {'vorgangstyp' in doc && <DetailSection title="Vorgangstyp">{doc.vorgangstyp}</DetailSection>}
                        {'beratungsstand' in doc && <DetailSection title="Beratungsstand">{doc.beratungsstand || 'N/A'}</DetailSection>}
                        {'drucksachetyp' in doc && <DetailSection title="Drucksachentyp">{doc.drucksachetyp}</DetailSection>}
                        {'dokumentnummer' in doc && <DetailSection title="Dokumentnummer">{doc.dokumentnummer}</DetailSection>}
                        {'aktivitaetsart' in doc && <DetailSection title="Aktivitätsart">{doc.aktivitaetsart}</DetailSection>}
                        {'funktion' in doc && <DetailSection title="Funktion">{doc.funktion}</DetailSection>}
                        {'fraktion' in doc && <DetailSection title="Fraktion">{doc.fraktion || 'N/A'}</DetailSection>}
                         {'gesta' in doc && <DetailSection title="GESTA-Nr.">{doc.gesta || 'N/A'}</DetailSection>}
                    </div>

                    {'initiative' in doc && <DetailSection title="Initiative">{renderList(doc.initiative)}</DetailSection>}
                    {'sachgebiet' in doc && <DetailSection title="Sachgebiete">{renderList(doc.sachgebiet)}</DetailSection>}
                    {'deskriptor' in doc && <DetailSection title="Deskriptoren">{renderDescriptors(doc.deskriptor)}</DetailSection>}
                    {'zustimmungsbeduerftigkeit' in doc && <DetailSection title="Zustimmungsbedürftigkeit">{renderList(doc.zustimmungsbeduerftigkeit)}</DetailSection>}
                    {'fundstelle' in doc && doc.fundstelle && <DetailSection title="Fundstelle">{renderFundstelle(doc.fundstelle)}</DetailSection>}
                    {'urheber' in doc && doc.urheber && <DetailSection title="Urheber">{renderUrheber(doc.urheber)}</DetailSection>}
                    {'vorgangsbezug' in doc && doc.vorgangsbezug && <DetailSection title="Vorgangsbezug">{renderVorgangsbezug(doc.vorgangsbezug)}</DetailSection>}
                     {'ressort' in doc && doc.ressort && (
                        <DetailSection title="Ressort">
                            {Array.isArray(doc.ressort)
                                ? renderRessort(doc.ressort)
                                : <p>{doc.ressort as string}</p>}
                        </DetailSection>
                    )}
                    {'verkuendung' in doc && doc.verkuendung && <DetailSection title="Verkündung">{renderVerkuendung(doc.verkuendung)}</DetailSection>}
                    {'inkrafttreten' in doc && doc.inkrafttreten && <DetailSection title="Inkrafttreten">{renderInkrafttreten(doc.inkrafttreten)}</DetailSection>}
                    {'vorgang_verlinkung' in doc && doc.vorgang_verlinkung && <DetailSection title="Verlinkte Vorgänge">{renderVerlinkungen(doc.vorgang_verlinkung)}</DetailSection>}
                </main>
            </div>
        </div>
    );
};


// Main App Component
const App: React.FC = () => {
    const [activeResource, setActiveResource] = useState<ResourceType>(ResourceType.VORGANG);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [results, setResults] = useState<AnyDocument[]>([]);
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [totalFound, setTotalFound] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<AnyDocument | null>(null);
    const [naturalQuery, setNaturalQuery] = useState('');
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const changeResource = (resType: ResourceType) => {
        setActiveResource(resType);
        setFilters({});
        setResults([]);
        setCursor(undefined);
        setTotalFound(0);
        setError(null);
        setHasSearched(false);
    };
    
    const prepareApiFilters = (currentFilters: Record<string, any>, resource: ResourceType) => {
        const apiFilters: Record<string, any> = {};
        const config = RESOURCE_CONFIG[resource];
        for (const key in currentFilters) {
            const value = currentFilters[key];
            if (!value) continue;
            
            const filterConfig = config.filters.find(f => f.name === key);
            if (filterConfig?.type === 'textarea' && typeof value === 'string') {
                 apiFilters[key] = value.split('\n').map((s: string) => s.trim()).filter(Boolean);
            } else {
                apiFilters[key] = value;
            }
        }
        return apiFilters;
    }

    const performSearch = useCallback(async (resource: ResourceType, apiFilters: Record<string, any>, loadMore: boolean) => {
        setIsLoading(true);
        if (!loadMore) {
            setError(null);
            setResults([]);
            setCursor(undefined);
        }
        setHasSearched(true);
        
        try {
            const response = await fetchDocuments(resource, apiFilters, loadMore ? cursor : undefined);
            setResults(prev => loadMore ? [...prev, ...response.documents] : response.documents);
            setCursor(response.cursor);
            setTotalFound(response.numFound);
             if (!loadMore) setError(null);
        } catch (e: any) {
            setError(e.message);
            if (!loadMore) {
                setResults([]);
                setTotalFound(0);
            }
        } finally {
            setIsLoading(false);
        }
    }, [cursor]);

    const handleManualSearch = () => {
        const apiFilters = prepareApiFilters(filters, activeResource);
        performSearch(activeResource, apiFilters, false);
    };

    const handleLoadMore = () => {
        const apiFilters = prepareApiFilters(filters, activeResource);
        performSearch(activeResource, apiFilters, true);
    };
    
    const handleGeminiSearch = async () => {
        if (!naturalQuery) return;
        setIsGeminiLoading(true);
        setError(null);
        setResults([]);
        setCursor(undefined);
        setTotalFound(0);
        setHasSearched(true);

        try {
            const geminiResult: GeminiSearchResult = await generateSearchParameters(naturalQuery);
            setActiveResource(geminiResult.resourceType);
            
            const uiFilters: Record<string, any> = {};
            const config = RESOURCE_CONFIG[geminiResult.resourceType];
            for (const key in geminiResult.filters) {
                 const filterConfig = config.filters.find(f => f.name === key);
                 if (filterConfig?.type === 'textarea' && Array.isArray(geminiResult.filters[key])) {
                     uiFilters[key] = geminiResult.filters[key].join('\n');
                 } else {
                     uiFilters[key] = geminiResult.filters[key];
                 }
            }
            setFilters(uiFilters);

            const apiFilters = prepareApiFilters(geminiResult.filters, geminiResult.resourceType);
            await performSearch(geminiResult.resourceType, apiFilters, false);

        } catch (e: any) {
            setError(e.message);
            setResults([]);
            setTotalFound(0);
        } finally {
            setIsGeminiLoading(false);
        }
    };


    const handleFilterChange = (name: string, value: string) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const resourceTypes = Object.keys(RESOURCE_CONFIG) as ResourceType[];
    const isSearching = isLoading || isGeminiLoading;

    const ResultsContent = () => {
        if (isSearching && results.length === 0) {
            return <Spinner />;
        }
        if (error) {
            return <ErrorDisplay message={error} />;
        }
        if (results.length > 0) {
            return (
                <>
                    <div className="mb-4 text-slate-400 text-sm">
                        {`${totalFound.toLocaleString('de-DE')} Ergebnisse gefunden.`}
                    </div>
                    <div className="space-y-4">
                        {results.map((doc, index) => (
                            <DocumentCard key={`${doc.id}-${index}`} doc={doc} onSelect={setSelectedDoc} />
                        ))}
                    </div>
                    {results.length < totalFound && !isLoading && (
                         <div className="mt-8 flex justify-center">
                             <button
                                 onClick={handleLoadMore}
                                 className="bg-slate-700 text-white font-bold py-2 px-6 rounded-md hover:bg-slate-600 transition duration-300"
                             >
                                 Mehr laden
                             </button>
                         </div>
                    )}
                    {isLoading && results.length > 0 && <Spinner />}
                </>
            );
        }
        if (hasSearched) {
            return <NoResults />;
        }
        return <InitialState />;
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
            <style>{`
              :root { --primary-500: 139 92 246; }
              .bg-primary-600 { background-color: rgb(124 58 237); }
              .hover\\:bg-primary-700:hover { background-color: rgb(109 40 217); }
              .text-primary-300 { color: rgb(196 181 253); }
              .text-primary-400 { color: rgb(167 139 250); }
              .border-primary-500 { border-color: rgb(139 92 246); }
              .focus\\:ring-primary-500:focus { --tw-ring-color: rgb(139 92 246); }
              .focus\\:border-primary-500:focus { border-color: rgb(139 92 246); }
              .border-t-transparent { border-top-color: transparent; }
              .bg-primary-800\\/80 { background-color: rgba(67, 56, 202, 0.8); }
              .text-primary-200 { color: rgb(224 231 255); }
              .bg-green-800\\/80 { background-color: rgba(22, 101, 52, 0.8); }
              .text-green-200 { color: rgb(187, 247, 208); }
              .bg-red-900\\/50 { background-color: rgba(76, 29, 29, 0.5); }
              .border-red-700 { border-color: rgb(185, 28, 28); }
              .text-red-200 { color: rgb(254, 202, 202); }
            `}</style>
            <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-40">
                <nav className="container mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                         <h1 className="text-2xl font-bold text-white">Bundestag DIP Explorer</h1>
                    </div>
                     <div className="flex space-x-1 border-b-2 border-transparent overflow-x-auto">
                        {resourceTypes.map(resType => {
                            const config = RESOURCE_CONFIG[resType];
                            const Icon = config.icon;
                            const isActive = activeResource === resType;
                            return (
                                <button
                                    key={resType}
                                    onClick={() => changeResource(resType)}
                                    className={`flex items-center gap-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 focus:outline-none ${
                                        isActive
                                            ? 'border-b-2 border-primary-500 text-primary-300'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : 'text-slate-500'}`} />
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>
                </nav>
            </header>

            <main className="container mx-auto p-4 lg:p-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-100 mb-2">Intelligente Suche</h2>
                    <p className="text-slate-400 mb-4 text-sm max-w-2xl">
                        Beschreiben Sie, was Sie finden möchten. Die KI wählt die passenden Filter für Sie aus und füllt das Formular unten aus.
                    </p>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={naturalQuery}
                            onChange={(e) => setNaturalQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGeminiSearch()}
                            placeholder="z.B. 'Alle Gesetze zur Digitalisierung aus der 20. Wahlperiode'"
                            className="w-full bg-slate-800 border border-slate-600 rounded-md p-3 text-lg text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                            disabled={isSearching}
                        />
                        <button
                            onClick={handleGeminiSearch}
                            disabled={isSearching || !naturalQuery}
                            className="bg-primary-600 text-white font-bold py-3 px-5 rounded-md hover:bg-primary-700 transition duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isGeminiLoading ? <Spinner small /> : <SearchIcon className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    <aside className="lg:col-span-4 xl:col-span-3 mb-6 lg:mb-0">
                        <FilterPanel 
                            activeResource={activeResource}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onSearch={handleManualSearch}
                            isLoading={isLoading}
                        />
                    </aside>
                    <div className="lg:col-span-8 xl:col-span-9">
                       <ResultsContent />
                    </div>
                </div>
            </main>

            {selectedDoc && <DocumentDetailModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}
        </div>
    );
};

export default App;
