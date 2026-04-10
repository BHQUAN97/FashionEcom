import { type SectionDefinition } from './types';

// Section imports
import { heroSliderDefinition } from '../sections/hero-slider';
import { announcementBarDefinition } from '../sections/announcement-bar';
import { categoryGridDefinition } from '../sections/category-grid';
import { productCarouselDefinition } from '../sections/product-carousel';
import { trustBarDefinition } from '../sections/trust-bar';
import { spacerDefinition } from '../sections/spacer';
import { dividerDefinition } from '../sections/divider';
import { featuredProductsTabDefinition } from '../sections/featured-products-tab';
import { lookbookDefinition } from '../sections/lookbook';
import { bannerFullwidthDefinition } from '../sections/banner-fullwidth';
import { bannerColumnsDefinition } from '../sections/banner-columns';
import { textImageDefinition } from '../sections/text-image';
import { videoDefinition } from '../sections/video';
import { newsletterDefinition } from '../sections/newsletter';
import { flashSaleCountdownDefinition } from '../sections/flash-sale-countdown';
import { customHtmlDefinition } from '../sections/custom-html';

/**
 * Registry chua tat ca section definitions
 * Palette, Canvas, Editor deu doc tu day
 */
const sectionRegistry = new Map<string, SectionDefinition>();

function register(def: SectionDefinition) {
  sectionRegistry.set(def.type, def);
}

// Dang ky tat ca 16 section types
register(heroSliderDefinition);
register(announcementBarDefinition);
register(categoryGridDefinition);
register(productCarouselDefinition);
register(trustBarDefinition);
register(spacerDefinition);
register(dividerDefinition);
register(featuredProductsTabDefinition);
register(lookbookDefinition);
register(bannerFullwidthDefinition);
register(bannerColumnsDefinition);
register(textImageDefinition);
register(videoDefinition);
register(newsletterDefinition);
register(flashSaleCountdownDefinition);
register(customHtmlDefinition);

export { sectionRegistry };

/** Lay definition theo type */
export function getSectionDefinition(type: string): SectionDefinition | undefined {
  return sectionRegistry.get(type);
}

/** Lay tat ca definitions (cho palette) */
export function getAllSectionDefinitions(): SectionDefinition[] {
  return Array.from(sectionRegistry.values());
}

/** Lay definitions theo group */
export function getSectionDefinitionsByGroup(group: string): SectionDefinition[] {
  return Array.from(sectionRegistry.values()).filter(d => d.group === group);
}
