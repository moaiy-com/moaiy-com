/**
 * Facts for the current official macOS release of Moaiy.
 * Re-check https://github.com/moaiy-com/moaiy/releases/latest before editing.
 * v1.0.5 (published 2026-11-27T14:52:26Z) ships one Apple Silicon DMG and
 * records Signing Mode: unsigned. It does not publish an Intel disk image.
 */
export const release = {
  version: '1.0.5',
  tag: 'v1.0.5',
  signingMode: 'unsigned',
  developerIdSigned: false,
  notarized: false,
  operatingSystem:
    'macOS 13.0 (Ventura), macOS 14 (Sonoma), macOS 15 (Sequoia), or later',
  releaseUrl: 'https://github.com/moaiy-com/moaiy/releases/tag/v1.0.5',
  releasesUrl: 'https://github.com/moaiy-com/moaiy/releases',
  sourceUrl: 'https://github.com/moaiy-com/moaiy',
  appleSiliconDmg: {
    fileName: 'Moaiy-1.0.5-macos-apple-silicon.dmg',
    arch: 'arm64',
    url: 'https://github.com/moaiy-com/moaiy/releases/download/v1.0.5/Moaiy-1.0.5-macos-apple-silicon.dmg',
    sha256: 'b4cb22c6bdefbd72eb6bf7c73266675cd027b197eb87f7b1bbdeb2a116d904ff',
  },
  sha256Sums: {
    fileName: 'SHA256SUMS.txt',
    url: 'https://github.com/moaiy-com/moaiy/releases/download/v1.0.5/SHA256SUMS.txt',
  },
  includesIntelDiskImage: false,
} as const;
