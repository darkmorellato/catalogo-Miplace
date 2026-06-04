// ============================================================
// types/product.d.ts
// Tipos relacionados a produtos (produtos.json / MiplaceProducts)
// Declarações globais (arquivo NÃO é módulo: sem import/export)
// ============================================================

interface ProductSpec {
  label: string;
  value: string;
}

interface ProductHighlight {
  title: string;
  text: string;
}

type ProductBrand = 'Realme' | 'Honor' | 'Motorola' | 'Redmi' | 'Poco' | 'iPhone';

interface Product {
  id: number;
  brand: ProductBrand;
  name: string;
  image: string;
  price?: string;
  specialPrice?: string;
  description?: string;
  specs?: ProductSpec[];
  highlights?: ProductHighlight[];
  gallery?: string[];
  highlight?: boolean;
}
