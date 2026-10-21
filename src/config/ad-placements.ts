export type AdPageKey =
  | 'docs'
  | 'features'
  | 'encrypt-files-on-macos'
  | 'openpgp-made-simple'
  | 'gpg-tools-alternative'
  | 'smartcard-encryption-guide';

export interface AdPlacement {
  placementId: string;
  slotId: string;
  minHeight?: number;
  label?: string;
}

const adSlotIds = {
  docs_mid_1: '8755204015',
  docs_pre_faq_1: '9189272105',
  features_mid_1: '3638608702',
  guide_mid_1: '1012445362',
  guide_bottom_1: '7612453243',
} as const;

export const adPlacementMap: Record<AdPageKey, AdPlacement[]> = {
  docs: [
    {
      placementId: 'docs_pre_faq_1',
      slotId: adSlotIds.docs_pre_faq_1,
      minHeight: 120,
      label: 'Sponsored',
    },
  ],
  features: [
    {
      placementId: 'features_mid_1',
      slotId: adSlotIds.features_mid_1,
      minHeight: 120,
      label: 'Sponsored',
    },
  ],
  'encrypt-files-on-macos': [
    {
      placementId: 'encrypt_macos_mid_1',
      slotId: adSlotIds.docs_mid_1,
      minHeight: 120,
      label: 'Sponsored',
    },
  ],
  'openpgp-made-simple': [
    {
      placementId: 'openpgp_simple_mid_1',
      slotId: adSlotIds.guide_mid_1,
      minHeight: 120,
      label: 'Sponsored',
    },
  ],
  'gpg-tools-alternative': [
    {
      placementId: 'gpg_alt_mid_1',
      slotId: adSlotIds.guide_bottom_1,
      minHeight: 120,
      label: 'Sponsored',
    },
  ],
  'smartcard-encryption-guide': [
    {
      placementId: 'smartcard_guide_mid_1',
      slotId: adSlotIds.docs_mid_1,
      minHeight: 120,
      label: 'Sponsored',
    },
  ],
};
