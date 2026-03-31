export interface SeoSchema {
  [key: string]: unknown;
}

export interface SeoPageConfig {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  robots?: string;
  currentPage?:
    | 'home'
    | 'features'
    | 'security'
    | 'docs'
    | 'download'
    | 'about'
    | 'roadmap'
    | 'security-whitepaper'
    | 'release-notes'
    | 'verification'
    | 'encrypt-files-on-macos'
    | 'openpgp-made-simple'
    | 'gpg-tools-alternative';
  schema?: SeoSchema[];
}

const SITE_URL = 'https://moaiy.com';
const DEFAULT_OG_IMAGE = '/og-image.svg';

const organizationSchema: SeoSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Moaiy',
  url: SITE_URL,
  logo: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
  sameAs: ['https://github.com/moaiy-com/moaiy', 'https://x.com/moaiycom'],
};

const softwareApplicationSchema: SeoSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Moaiy',
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'macOS, Windows, Linux',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  softwareVersion: 'Active development',
  url: SITE_URL,
  downloadUrl: 'https://github.com/moaiy-com/moaiy/releases',
  description:
    'Moaiy is an open-source encryption tool focused on practical file encryption workflows for individuals and teams.',
};

function breadcrumbSchema(entries: Array<{ name: string; path: string }>): SeoSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: `${SITE_URL}${entry.path}`,
    })),
  };
}

const docsFaqSchema: SeoSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Moaiy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Moaiy is an open-source encryption project designed to simplify OpenPGP-style file encryption workflows.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I download Moaiy safely?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Use the official GitHub Releases page and verify checksums before installation.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Moaiy process plaintext on a remote server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Moaiy is designed for local-first encryption workflows and documents this model in its security pages.',
      },
    },
  ],
};

export const pageSeo: Record<string, SeoPageConfig> = {
  home: {
    title: 'Moaiy | Open-Source Encryption Made Practical',
    description:
      'Moaiy is an open-source encryption tool for practical, secure file workflows. Explore docs, download sources, and verify security practices.',
    canonicalPath: '/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'home',
    schema: [organizationSchema, softwareApplicationSchema],
  },
  features: {
    title: 'Moaiy Features | Open-Source File Encryption Workflows',
    description:
      'Explore Moaiy features for key management, file encryption, and OpenPGP-compatible workflows built for clarity and operational security.',
    canonicalPath: '/features/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'features',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Features', path: '/features/' },
      ]),
    ],
  },
  security: {
    title: 'Moaiy Security | Encryption Model, Disclosure, and Audit Status',
    description:
      'Review Moaiy security architecture, responsible disclosure policy, audit status, and operational practices for encryption risk reduction.',
    canonicalPath: '/security/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'security',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Security', path: '/security/' },
      ]),
    ],
  },
  docs: {
    title: 'Moaiy Docs | Install, Encrypt, Decrypt, and Manage Keys',
    description:
      'Task-focused Moaiy documentation for installation, encryption, decryption, key handling, and common OpenPGP workflows.',
    canonicalPath: '/docs/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'docs',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Docs', path: '/docs/' },
      ]),
      docsFaqSchema,
    ],
  },
  download: {
    title: 'Download Moaiy | Official Releases and Verification',
    description:
      'Download Moaiy from official channels, view platform status, and verify release checksums before installation.',
    canonicalPath: '/download/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'download',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Download', path: '/download/' },
      ]),
    ],
  },
  about: {
    title: 'About Moaiy | Mission and Open-Source Encryption Direction',
    description:
      'Learn about Moaiy mission, open-source approach, and the team focus on practical encryption for individuals and teams.',
    canonicalPath: '/about/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'about',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about/' },
      ]),
    ],
  },
  roadmap: {
    title: 'Moaiy Roadmap | Planned Features and Release Direction',
    description:
      'Track Moaiy roadmap milestones including platform expansion, API planning, and documentation priorities.',
    canonicalPath: '/roadmap/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'roadmap',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Roadmap', path: '/roadmap/' },
      ]),
    ],
  },
  securityWhitepaper: {
    title: 'Moaiy Security Whitepaper (Draft) | Threat Model and Controls',
    description:
      'Read the Moaiy security whitepaper draft covering threat model assumptions, security controls, and disclosure process.',
    canonicalPath: '/security-whitepaper/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'security-whitepaper',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Security Whitepaper', path: '/security-whitepaper/' },
      ]),
    ],
  },
  releaseNotes: {
    title: 'Moaiy Release Notes | Version History and Change Log',
    description:
      'Browse Moaiy release notes, version history highlights, and links to official GitHub release artifacts.',
    canonicalPath: '/release-notes/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'release-notes',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Release Notes', path: '/release-notes/' },
      ]),
    ],
  },
  verification: {
    title: 'Moaiy Verification | Checksums and Signature Validation Guide',
    description:
      'Learn how to validate Moaiy release checksums and signatures to reduce software supply-chain risk during installation.',
    canonicalPath: '/verification/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'verification',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Verification', path: '/verification/' },
      ]),
    ],
  },
  encryptFilesOnMacos: {
    title: 'Encrypt Files on macOS with Moaiy | Practical Step-by-Step Guide',
    description:
      'A practical guide to encrypt files on macOS using Moaiy, including setup, key handling, and safe sharing workflows.',
    canonicalPath: '/encrypt-files-on-macos/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'encrypt-files-on-macos',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Encrypt Files on macOS', path: '/encrypt-files-on-macos/' },
      ]),
    ],
  },
  openpgpMadeSimple: {
    title: 'OpenPGP Made Simple with Moaiy | User-Oriented Encryption',
    description:
      'Understand OpenPGP basics and use Moaiy to run simpler encryption workflows without sacrificing control.',
    canonicalPath: '/openpgp-made-simple/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'openpgp-made-simple',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'OpenPGP Made Simple', path: '/openpgp-made-simple/' },
      ]),
    ],
  },
  gpgToolsAlternative: {
    title: 'Moaiy as a GPG Tools Alternative | Open-Source Encryption UX',
    description:
      'Compare Moaiy with traditional GPG workflows and evaluate whether a simpler open-source encryption experience fits your team.',
    canonicalPath: '/gpg-tools-alternative/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'gpg-tools-alternative',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'GPG Tools Alternative', path: '/gpg-tools-alternative/' },
      ]),
    ],
  },
};
