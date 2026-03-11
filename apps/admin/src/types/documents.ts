import { MenuWithPublishStatus } from '@sebastians/shared-types';

export type PaperSize = 'A4' | 'A3';
export type Orientation = 'portrait' | 'landscape';

export interface PrintSettings {
  paperSize: PaperSize;
  orientation: Orientation;
  languageCode: string; // The selected translation
  showImages: boolean;
  showPrices: boolean;
}

// This helps track which menus are intended for print
export interface PrintableMenu extends MenuWithPublishStatus {
  // We can add print-specific metadata here if needed later
}