import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type SupportedLang = 'en' | 'de' | 'es' | 'fr' | 'it' | 'nl' | 'pt';

interface AllergyEntry {
  number: number;
  translations: Record<SupportedLang, string>;
}

interface AllergyLegendProps {
  lang?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ALLERGY_DATA: AllergyEntry[] = [
  { number: 1,  translations: { en: 'Celery',    de: 'Sellerie',         es: 'Apio',               fr: 'Céleri',                  it: 'Sedano',              nl: 'Selderij',         pt: 'Aipo'                   } },
  { number: 2,  translations: { en: 'Corn',      de: 'Mais',             es: 'Maíz',               fr: 'Maïs',                    it: 'Mais',                nl: 'Maïs',             pt: 'Milho'                  } },
  { number: 3,  translations: { en: 'Dairy',     de: 'Milchprodukte',    es: 'Lácteos',            fr: 'Produits laitiers',       it: 'Latticini',           nl: 'Zuivelproducten',  pt: 'Laticínios'             } },
  { number: 4,  translations: { en: 'Eggs',      de: 'Eier',             es: 'Huevos',             fr: 'Œufs',                    it: 'Uova',                nl: 'Eieren',           pt: 'Ovos'                   } },
  { number: 5,  translations: { en: 'Fish',      de: 'Fisch',            es: 'Pescado',            fr: 'Poisson',                 it: 'Pesce',               nl: 'Vis',              pt: 'Peixe'                  } },
  { number: 6,  translations: { en: 'Gluten',    de: 'Gluten',           es: 'Gluten',             fr: 'Gluten',                  it: 'Glutine',             nl: 'Gluten',           pt: 'Glúten'                 } },
  { number: 7,  translations: { en: 'Lupin',     de: 'Lupine',           es: 'Altramuz',           fr: 'Lupin',                   it: 'Lupino',              nl: 'Lupine',           pt: 'Tremoço'                } },
  { number: 8,  translations: { en: 'Milk',      de: 'Milch',            es: 'Leche',              fr: 'Lait',                    it: 'Latte',               nl: 'Melk',             pt: 'Leite'                  } },
  { number: 9,  translations: { en: 'Molluscs',  de: 'Weichtiere',       es: 'Moluscos',           fr: 'Mollusques',              it: 'Molluschi',           nl: 'Weekdieren',       pt: 'Moluscos'               } },
  { number: 10, translations: { en: 'Mustard',   de: 'Senf',             es: 'Mostaza',            fr: 'Moutarde',                it: 'Senape',              nl: 'Mosterd',          pt: 'Mostarda'               } },
  { number: 11, translations: { en: 'Nuts',      de: 'Nüsse',            es: 'Frutos secos',       fr: 'Fruits à coque',          it: 'Frutta a guscio',     nl: 'Noten',            pt: 'Frutos de casca rija'   } },
  { number: 12, translations: { en: 'Peanuts',   de: 'Erdnüsse',         es: 'Cacahuetes',         fr: 'Arachides',               it: 'Arachidi',            nl: "Pinda's",          pt: 'Amendoins'              } },
  { number: 13, translations: { en: 'Propolis',  de: 'Propolis',         es: 'Propóleo',           fr: 'Propolis',                it: 'Propoli',             nl: 'Propolis',         pt: 'Própolis'               } },
  { number: 14, translations: { en: 'Sesame',    de: 'Sesam',            es: 'Sésamo',             fr: 'Sésame',                  it: 'Sesamo',              nl: 'Sesam',            pt: 'Sésamo'                 } },
  { number: 15, translations: { en: 'Shellfish', de: 'Krebstiere',       es: 'Crustáceos',         fr: 'Crustacés',               it: 'Crostacei',           nl: 'Schaaldieren',     pt: 'Crustáceos'             } },
  { number: 16, translations: { en: 'Soya',      de: 'Soja',             es: 'Soja',               fr: 'Soja',                    it: 'Soia',                nl: 'Soja',             pt: 'Soja'                   } },
  { number: 17, translations: { en: 'Sulphites', de: 'Sulfite',          es: 'Sulfitos',           fr: 'Sulfites',                it: 'Solfiti',             nl: 'Sulfieten',        pt: 'Sulfitos'               } },
  { number: 18, translations: { en: 'Wheat',     de: 'Weizen',           es: 'Trigo',              fr: 'Blé',                     it: 'Frumento',            nl: 'Tarwe',            pt: 'Trigo'                  } },
];

const HEADINGS: Record<SupportedLang, { title: string; subtitle: string }> = {
  en: { title: 'Allergen Information',         subtitle: 'Please inform your server of any allergies before ordering.' },
  de: { title: 'Allergeninformationen',        subtitle: 'Bitte informieren Sie Ihren Kellner vor der Bestellung über etwaige Allergien.' },
  es: { title: 'Información sobre alérgenos', subtitle: 'Por favor, informe a su camarero sobre cualquier alergia antes de pedir.' },
  fr: { title: 'Informations allergènes',      subtitle: 'Veuillez informer votre serveur de toute allergie avant de commander.' },
  it: { title: 'Informazioni sugli allergeni', subtitle: 'Si prega di informare il personale di eventuali allergie prima di ordinare.' },
  nl: { title: 'Allergeneninformatie',         subtitle: 'Informeer uw bediening over eventuele allergieën voordat u bestelt.' },
  pt: { title: 'Informação sobre alergénios',  subtitle: 'Por favor, informe o servidor sobre quaisquer alergias antes de encomendar.' },
};

// ─── Component ────────────────────────────────────────────────────────────────

const AllergyLegend: React.FC<AllergyLegendProps> = ({ lang = 'en' }) => {
  const resolvedLang: SupportedLang = (lang in HEADINGS ? lang : 'en') as SupportedLang;
  const { title, subtitle } = HEADINGS[resolvedLang];

  return (
    <section className="break-inside-avoid">

      {/* Header — matches category header style in PrintPreview */}
      <div className="text-center py-4 border-t">
        <h2 className="text-xl font-bold uppercase border-b-2 border-black inline-block pb-1 px-4 mb-2">
          {title}
        </h2>
        <p className="text-sm text-gray-500 italic max-w-lg mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Allergy grid — 3 columns, compact */}
      <div className="grid grid-cols-6 gap-x-6 gap-y-2 border-b pb-4">
        {ALLERGY_DATA.map((allergy) => (
          <div key={allergy.number} className="flex items-center gap-2">
            <span className="flex-shrink-0 text-orange-500 text-[10px] font-bold flex items-center justify-center w-3">
              {allergy.number}
            </span>
            <span className="text-xs text-gray-800">
              {allergy.translations[resolvedLang]}
              {/*resolvedLang !== 'en' && (
                <span className="text-gray-400 italic ml-1">
                  ({allergy.translations.en})
                </span>
              )*/}
            </span>
          </div>
        ))}
      </div>

    </section>
  );
};

export default AllergyLegend;