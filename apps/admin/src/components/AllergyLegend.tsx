import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

// ─── Types ────────────────────────────────────────────────────────────────────

type SupportedLang = 'en' | 'de' | 'es' | 'fr' | 'it' | 'nl' | 'pt';

interface AllergyEntry {
  number: number;
  key: string; // canonical English name, matches PREDEFINED_ALLERGIES
  translations: Record<SupportedLang, string>;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ALLERGY_DATA: AllergyEntry[] = [
  {
    number: 1,
    key: 'Celery',
    translations: {
      en: 'Celery',
      de: 'Sellerie',
      es: 'Apio',
      fr: 'Céleri',
      it: 'Sedano',
      nl: 'Selderij',
      pt: 'Aipo',
    },
  },
  {
    number: 2,
    key: 'Corn',
    translations: {
      en: 'Corn',
      de: 'Mais',
      es: 'Maíz',
      fr: 'Maïs',
      it: 'Mais',
      nl: 'Maïs',
      pt: 'Milho',
    },
  },
  {
    number: 3,
    key: 'Dairy',
    translations: {
      en: 'Dairy',
      de: 'Milchprodukte',
      es: 'Lácteos',
      fr: 'Produits laitiers',
      it: 'Latticini',
      nl: 'Zuivelproducten',
      pt: 'Laticínios',
    },
  },
  {
    number: 4,
    key: 'Eggs',
    translations: {
      en: 'Eggs',
      de: 'Eier',
      es: 'Huevos',
      fr: 'Œufs',
      it: 'Uova',
      nl: 'Eieren',
      pt: 'Ovos',
    },
  },
  {
    number: 5,
    key: 'Fish',
    translations: {
      en: 'Fish',
      de: 'Fisch',
      es: 'Pescado',
      fr: 'Poisson',
      it: 'Pesce',
      nl: 'Vis',
      pt: 'Peixe',
    },
  },
  {
    number: 6,
    key: 'Gluten',
    translations: {
      en: 'Gluten',
      de: 'Gluten',
      es: 'Gluten',
      fr: 'Gluten',
      it: 'Glutine',
      nl: 'Gluten',
      pt: 'Glúten',
    },
  },
  {
    number: 7,
    key: 'Lupin',
    translations: {
      en: 'Lupin',
      de: 'Lupine',
      es: 'Altramuz',
      fr: 'Lupin',
      it: 'Lupino',
      nl: 'Lupine',
      pt: 'Tremoço',
    },
  },
  {
    number: 8,
    key: 'Milk',
    translations: {
      en: 'Milk',
      de: 'Milch',
      es: 'Leche',
      fr: 'Lait',
      it: 'Latte',
      nl: 'Melk',
      pt: 'Leite',
    },
  },
  {
    number: 9,
    key: 'Molluscs',
    translations: {
      en: 'Molluscs',
      de: 'Weichtiere',
      es: 'Moluscos',
      fr: 'Mollusques',
      it: 'Molluschi',
      nl: 'Weekdieren',
      pt: 'Moluscos',
    },
  },
  {
    number: 10,
    key: 'Mustard',
    translations: {
      en: 'Mustard',
      de: 'Senf',
      es: 'Mostaza',
      fr: 'Moutarde',
      it: 'Senape',
      nl: 'Mosterd',
      pt: 'Mostarda',
    },
  },
  {
    number: 11,
    key: 'Nuts',
    translations: {
      en: 'Nuts',
      de: 'Nüsse',
      es: 'Frutos secos',
      fr: 'Fruits à coque',
      it: 'Frutta a guscio',
      nl: 'Noten',
      pt: 'Frutos de casca rija',
    },
  },
  {
    number: 12,
    key: 'Peanuts',
    translations: {
      en: 'Peanuts',
      de: 'Erdnüsse',
      es: 'Cacahuetes',
      fr: 'Arachides',
      it: 'Arachidi',
      nl: 'Pinda\'s',
      pt: 'Amendoins',
    },
  },
  {
    number: 13,
    key: 'Propolis',
    translations: {
      en: 'Propolis',
      de: 'Propolis',
      es: 'Propóleo',
      fr: 'Propolis',
      it: 'Propoli',
      nl: 'Propolis',
      pt: 'Própolis',
    },
  },
  {
    number: 14,
    key: 'Sesame',
    translations: {
      en: 'Sesame',
      de: 'Sesam',
      es: 'Sésamo',
      fr: 'Sésame',
      it: 'Sesamo',
      nl: 'Sesam',
      pt: 'Sésamo',
    },
  },
  {
    number: 15,
    key: 'Shellfish',
    translations: {
      en: 'Shellfish',
      de: 'Krebstiere',
      es: 'Crustáceos',
      fr: 'Crustacés',
      it: 'Crostacei',
      nl: 'Schaaldieren',
      pt: 'Crustáceos',
    },
  },
  {
    number: 16,
    key: 'Soya',
    translations: {
      en: 'Soya',
      de: 'Soja',
      es: 'Soja',
      fr: 'Soja',
      it: 'Soia',
      nl: 'Soja',
      pt: 'Soja',
    },
  },
  {
    number: 17,
    key: 'Sulphites',
    translations: {
      en: 'Sulphites',
      de: 'Sulfite',
      es: 'Sulfitos',
      fr: 'Sulfites',
      it: 'Solfiti',
      nl: 'Sulfieten',
      pt: 'Sulfitos',
    },
  },
  {
    number: 18,
    key: 'Wheat',
    translations: {
      en: 'Wheat',
      de: 'Weizen',
      es: 'Trigo',
      fr: 'Blé',
      it: 'Frumento',
      nl: 'Tarwe',
      pt: 'Trigo',
    },
  },
];

// ─── Heading translations ──────────────────────────────────────────────────────

const HEADINGS: Record<SupportedLang, { title: string; subtitle: string }> = {
  en: { title: 'Allergen Information',    subtitle: 'The following allergens may be present in our dishes. Please inform your server of any allergies before ordering.' },
  de: { title: 'Allergeninformationen',   subtitle: 'Die folgenden Allergene können in unseren Gerichten enthalten sein. Bitte informieren Sie Ihren Kellner vor der Bestellung über etwaige Allergien.' },
  es: { title: 'Información sobre alérgenos', subtitle: 'Los siguientes alérgenos pueden estar presentes en nuestros platos. Por favor, informe a su camarero sobre cualquier alergia antes de realizar su pedido.' },
  fr: { title: 'Informations sur les allergènes', subtitle: 'Les allergènes suivants peuvent être présents dans nos plats. Veuillez informer votre serveur de toute allergie avant de commander.' },
  it: { title: 'Informazioni sugli allergeni', subtitle: 'I seguenti allergeni potrebbero essere presenti nei nostri piatti. Si prega di informare il personale di eventuali allergie prima di ordinare.' },
  nl: { title: 'Allergeneninformatie',    subtitle: 'De volgende allergenen kunnen aanwezig zijn in onze gerechten. Informeer uw bediening over eventuele allergieën voordat u bestelt.' },
  pt: { title: 'Informação sobre alergénios', subtitle: 'Os seguintes alergénios podem estar presentes nos nossos pratos. Por favor, informe o seu servidor sobre quaisquer alergias antes de encomendar.' },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface AllergyLegendProps {
  lang?: SupportedLang;
  size?: 'A4' | 'A3';
}

const AllergyLegend: React.FC<AllergyLegendProps> = ({
  lang = 'en',
  size = 'A4',
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const resolvedLang: SupportedLang = (HEADINGS[lang] ? lang : 'en') as SupportedLang;
  const { title, subtitle } = HEADINGS[resolvedLang];

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Allergen-Information-${resolvedLang.toUpperCase()}`,
  });

  return (
    <div className="bg-gray-100 min-h-screen pb-20">

      {/* Control Bar */}
      <div className="bg-white border-b sticky top-0 z-10 p-4 mb-8 flex justify-between items-center px-8 shadow-sm print:hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Allergen Legend</h1>
          <p className="text-sm text-gray-500">
            Language: <span className="uppercase font-semibold">{resolvedLang}</span> | Size: {size}
          </p>
        </div>
        <button
          onClick={() => handlePrint()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          Print Legend
        </button>
      </div>

      {/* Printable Area */}
      <div
        ref={componentRef}
        className={`bg-white mx-auto shadow-2xl print:shadow-none p-10 pt-16 ${size === 'A3' ? 'w-[297mm] min-h-[420mm]' : 'w-[210mm] min-h-[297mm]'}`}
      >
        {/* Page Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold uppercase tracking-wide border-b-2 border-black inline-block pb-1 px-6 mb-4">
            {title}
          </h2>
          <p className="text-sm text-gray-500 italic max-w-lg mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Allergy Grid */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          {ALLERGY_DATA.map((allergy) => (
            <div key={allergy.number} className="flex items-center gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-400 text-white text-xs font-bold flex items-center justify-center">
                {allergy.number}
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-gray-800">
                  {allergy.translations[resolvedLang]}
                </span>
                {/* Show English key alongside if not already English */}
                {resolvedLang !== 'en' && (
                  <span className="text-[10px] text-gray-400 italic">
                    {allergy.translations.en}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: ${size === 'A3' ? 'A3' : 'A4'} portrait;
            margin: 10mm;
          }
          body { margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default AllergyLegend;