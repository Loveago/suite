export type PropertyKey = 'tema' | 'accra';

export interface PropertyOption {
  key: PropertyKey;
  slug: string;
  name: string;
  city: string;
  label: string;
  shortLabel: string;
  description: string;
  fallbackPropertyId: string;
}

export const propertyOptions: PropertyOption[] = [
  {
    key: 'tema',
    slug: 'the-suite-tema',
    name: 'The Suite',
    city: 'Tema',
    label: 'The Suite at Tema',
    shortLabel: 'Tema',
    description: 'Luxury rooms and elevated stays in Tema community 20.',
    fallbackPropertyId: 'tema-property',
  },
  {
    key: 'accra',
    slug: 'american-house-accra',
    name: 'American House',
    city: 'Accra',
    label: 'American House at Accra',
    shortLabel: 'Accra',
    description: 'A refined city stay experience in Accra with modern comfort and premium finishes.',
    fallbackPropertyId: 'accra-property',
  },
];

export const propertyKeyBySlug = Object.fromEntries(propertyOptions.map((property) => [property.slug, property.key])) as Record<string, PropertyKey>;

export const propertyKeyByName = Object.fromEntries(
  propertyOptions.map((property) => [property.name.trim().toLowerCase(), property.key])
) as Record<string, PropertyKey>;

export const getPropertyByKey = (key: PropertyKey) => propertyOptions.find((property) => property.key === key) || propertyOptions[0];

export const getPropertyKeyFromName = (name?: string | null): PropertyKey | null => {
  if (!name) return null;
  return propertyKeyByName[name.trim().toLowerCase()] || null;
};

export const getPropertyKeyFromSlug = (slug?: string | null): PropertyKey | null => {
  if (!slug) return null;
  return propertyKeyBySlug[slug] || null;
};
