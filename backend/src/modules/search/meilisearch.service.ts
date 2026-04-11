import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SearchServiceInterface,
  SearchDocument,
  SearchResult,
} from './search-service.interface';

/**
 * Meilisearch implementation — typo-tolerance, Vietnamese synonyms
 * Fallback MySQL LIKE khi Meilisearch down
 */
@Injectable()
export class MeilisearchService implements SearchServiceInterface, OnModuleInit {
  private host: string;
  private masterKey: string;
  private indexName = 'products';
  private available = false;

  constructor(private config: ConfigService) {
    this.host = config.get('MEILISEARCH_HOST', 'http://localhost:7700');
    this.masterKey = config.get('MEILISEARCH_MASTER_KEY', '');
  }

  async onModuleInit() {
    try {
      await this.setupIndex();
      this.available = true;
    } catch {
      // Meilisearch chua san sang — fallback mode
      this.available = false;
    }
  }

  /** Cau hinh index ban dau — searchable, filterable, sortable attributes */
  private async setupIndex() {
    // Tao index neu chua co
    await this.meiliRequest('POST', '/indexes', {
      uid: this.indexName,
      primaryKey: 'id',
    }).catch(() => {}); // Ignore neu da ton tai

    // Config searchable attributes
    await this.meiliRequest('PUT', `/indexes/${this.indexName}/settings`, {
      searchableAttributes: [
        'name', 'code', 'categoryName', 'colors', 'sizes', 'material', 'tags', 'descriptionPlain',
      ],
      filterableAttributes: [
        'categorySlug', 'priceMin', 'priceMax', 'colors', 'sizes',
        'material', 'ratingAvg', 'inStock', 'isOnSale', 'status',
      ],
      sortableAttributes: ['priceMin', 'createdDate', 'soldCount', 'ratingAvg'],
      stopWords: ['va', 'cua', 'cai', 'la', 'nhung', 'mot', 'cho', 'trong', 'voi'],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
      },
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
      synonyms: {
        jean: ['denim', 'bo'],
        khoac: ['jacket', 'ao khoac'],
        polo: ['ao co be', 'ao polo'],
        'so mi': ['shirt', 'ao so mi'],
        thun: ['t-shirt', 'ao thun'],
        dam: ['vay', 'dress'],
        sneaker: ['giay the thao'],
      },
    });
  }

  async upsertDocument(doc: SearchDocument): Promise<void> {
    if (!this.available) return;
    await this.meiliRequest('POST', `/indexes/${this.indexName}/documents`, [doc]);
  }

  async upsertDocuments(docs: SearchDocument[]): Promise<void> {
    if (!this.available) return;
    // Batch 1000 documents moi lan
    for (let i = 0; i < docs.length; i += 1000) {
      const batch = docs.slice(i, i + 1000);
      await this.meiliRequest('POST', `/indexes/${this.indexName}/documents`, batch);
    }
  }

  async deleteDocument(id: string): Promise<void> {
    if (!this.available) return;
    await this.meiliRequest('DELETE', `/indexes/${this.indexName}/documents/${id}`);
  }

  async search(query: string, options?: {
    filters?: string;
    sort?: string[];
    page?: number;
    limit?: number;
  }): Promise<SearchResult> {
    if (!this.available) {
      return { hits: [], totalHits: 0, query, processingTimeMs: 0 };
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const body: Record<string, unknown> = {
      q: query,
      limit,
      offset: (page - 1) * limit,
    };
    if (options?.filters) body.filter = options.filters;
    if (options?.sort) body.sort = options.sort;

    const result = await this.meiliRequest('POST', `/indexes/${this.indexName}/search`, body);

    return {
      hits: result.hits || [],
      totalHits: result.estimatedTotalHits || 0,
      query,
      processingTimeMs: result.processingTimeMs || 0,
    };
  }

  async suggest(query: string, limit = 5): Promise<string[]> {
    if (!this.available) return [];
    const result = await this.search(query, { limit });
    return result.hits.map((h) => h.name);
  }

  async updateSynonyms(synonyms: Record<string, string[]>): Promise<void> {
    if (!this.available) return;
    await this.meiliRequest('PUT', `/indexes/${this.indexName}/settings/synonyms`, synonyms);
  }

  async getSynonyms(): Promise<Record<string, string[]>> {
    if (!this.available) return {};
    return this.meiliRequest('GET', `/indexes/${this.indexName}/settings/synonyms`);
  }

  /** Trigger full reindex */
  async reindex(): Promise<{ message: string }> {
    // Se duoc goi tu controller voi data tu DB
    return { message: 'Reindex triggered — use seed script to populate data' };
  }

  /** Kiem tra Meilisearch co san sang khong */
  isAvailable(): boolean {
    return this.available;
  }

  // ==================== Helper ====================

  private async meiliRequest(method: string, path: string, body?: unknown): Promise<any> {
    const res = await fetch(`${this.host}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.masterKey && { Authorization: `Bearer ${this.masterKey}` }),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Meilisearch error: ${res.status} ${error}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  }
}
