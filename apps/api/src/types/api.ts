export type CountrySummary = {
  code: string;
  name: string;
  enabled: boolean;
  sourceStatus: 'planned' | 'pilot' | 'active';
};

export type CompanySearchResult = {
  id: string;
  countryCode: string;
  registrationNumber: string;
  name: string;
  status: 'active' | 'inactive' | 'unknown' | 'dissolved' | 'liquidation' | 'bankruptcy';
  source: string;
  sourceName: string;
  recordOrigin: 'seed' | 'ingested';
  latestSourceAt: string | null;
  address: {
    line1: string | null;
    city: string | null;
    postalCode: string | null;
  };
  primaryActivity: {
    code: string | null;
    description: string | null;
  };
};
