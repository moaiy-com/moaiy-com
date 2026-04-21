export type AdPageKey = 'docs' | 'features' | 'download' | 'about';

export interface AdPlacement {
  placementId: string;
  slotId: string;
  minHeight?: number;
  label?: string;
}

// Replace each slot ID with the real `data-ad-slot` value from your AdSense ad units.
// Expected ad unit names:
// - docs_mid_1
// - docs_pre_faq_1
// - features_mid_1
// - download_mid_1
// - about_mid_1
const adSlotIds = {
  docs_mid_1: '8755204015',
  docs_pre_faq_1: '9189272105',
  features_mid_1: '3638608702',
  download_mid_1: '1012445362',
  about_mid_1: '7612453243',
} as const;

export const adPlacementMap: Record<AdPageKey, AdPlacement[]> = {
  docs: [
    {
      placementId: 'docs_mid_1',
      slotId: adSlotIds.docs_mid_1,
      minHeight: 280,
      label: 'Sponsored',
    },
    {
      placementId: 'docs_pre_faq_1',
      slotId: adSlotIds.docs_pre_faq_1,
      minHeight: 280,
      label: 'Sponsored',
    },
  ],
  features: [
    {
      placementId: 'features_mid_1',
      slotId: adSlotIds.features_mid_1,
      minHeight: 280,
      label: 'Sponsored',
    },
  ],
  download: [
    {
      placementId: 'download_mid_1',
      slotId: adSlotIds.download_mid_1,
      minHeight: 280,
      label: 'Sponsored',
    },
  ],
  about: [
    {
      placementId: 'about_mid_1',
      slotId: adSlotIds.about_mid_1,
      minHeight: 280,
      label: 'Sponsored',
    },
  ],
};
