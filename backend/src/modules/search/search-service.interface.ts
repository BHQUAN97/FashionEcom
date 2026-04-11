/**
 * Search Service interface — co the swap Meilisearch sang Algolia sau
 */
export interface SearchDocument {
  id: string;
  name: string;
  code: string;
  categoryName: string;
  categorySlug: string;
  colors: string[];
  sizes: string[];
  material: string;
  priceMin: number;
  priceMax: number;
  ratingAvg: number;
  soldCount: number;
  inStock: boolean;
  isOnSale: boolean;
  imageUrl: string;
  slug: string;
  tags: string[];
  descriptionPlain: string;
  status: number;
  createdDate: string;
}

export interface SearchResult {
  hits: SearchDocument[];
  totalHits: number;
  query: string;
  processingTimeMs: number;
}

export interface SearchServiceInterface {
  /** Dong bo 1 document */
  upsertDocument(doc: SearchDocument): Promise<void>;
  /** Dong bo nhieu documents */
  upsertDocuments(docs: SearchDocument[]): Promise<void>;
  /** Xoa document theo id */
  deleteDocument(id: string): Promise<void>;
  /** Tim kiem */
  search(query: string, options?: {
    filters?: string;
    sort?: string[];
    page?: number;
    limit?: number;
  }): Promise<SearchResult>;
  /** Goi y (autocomplete) */
  suggest(query: string, limit?: number): Promise<string[]>;
  /** Config synonyms */
  updateSynonyms(synonyms: Record<string, string[]>): Promise<void>;
  /** Lay synonyms */
  getSynonyms(): Promise<Record<string, string[]>>;
}
