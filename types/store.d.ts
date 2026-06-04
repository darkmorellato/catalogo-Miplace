// ============================================================
// types/store.d.ts
// Tipos relacionados a lojas (stores.js / STORES)
// Declarações globais (arquivo NÃO é módulo: sem import/export)
// ============================================================

interface StoreGeo {
  lat: number;
  lng: number;
}

interface StoreAddress {
  street: string;
  cep: string;
  mapsQuery: string;
}

interface StoreSocialMedia {
  handle: string;
  url: string;
}

interface StoreSocialWithName {
  name: string;
  url: string;
}

interface StoreLogo {
  jpg: string;
  png: string;
}

interface Store {
  id: string;
  name: string;
  city: string;
  logo: StoreLogo;
  address: StoreAddress;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  instagram: StoreSocialMedia;
  facebook: StoreSocialWithName;
  geo: StoreGeo;
}

interface StoresByCity {
  [city: string]: Store[];
}
