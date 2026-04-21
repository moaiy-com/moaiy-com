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
    | 'gpg-tools-alternative'
    | 'smartcard-encryption-guide';
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
  operatingSystem: 'macOS',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  softwareVersion: 'Active development',
  url: SITE_URL,
  downloadUrl: 'https://github.com/moaiy-com/moaiy/releases',
  description:
    'Moaiy is a free and open-source macOS app for simple file encryption.',
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
        text: 'Moaiy is a free and open-source macOS app that helps you encrypt files with simple steps.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I download Moaiy safely?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Download only from the official GitHub Releases page and verify checksums before installing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Moaiy process plaintext on a remote server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Moaiy is designed to encrypt files locally on your Mac.',
      },
    },
  ],
};

export const pageSeo: Record<string, SeoPageConfig> = {
  home: {
    title: 'Moaiy | Simple File Encryption for macOS',
    description:
      'Encrypt files on macOS with drag and drop. Moaiy is free, open source, and built for local privacy.',
    canonicalPath: '/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'home',
    schema: [organizationSchema, softwareApplicationSchema],
  },
  features: {
    title: 'Moaiy Features | Simple and Private File Encryption',
    description:
      'See how Moaiy helps you encrypt files on macOS with clear steps, open-source code, and easy verification.',
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
    title: 'Moaiy Security | How Your Files Stay Protected',
    description:
      'Read a plain-language security summary, then review technical details, reporting steps, and current status.',
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
    title: 'Moaiy Docs | Simple Guides for Encrypting Files',
    description:
      'Follow step-by-step guides to install Moaiy, encrypt and decrypt files, and verify downloads on macOS.',
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
    title: 'Download Moaiy | Official macOS Release',
    description:
      'Download Moaiy for macOS from the official GitHub Releases page and verify the file before installing.',
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
    title: 'About Moaiy | Simple, Open-Source File Protection',
    description:
      'Learn about Moaiy and its goal: making file encryption simple, transparent, and accessible to everyone.',
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
    title: 'Moaiy Roadmap | What Is Available and What Is Next',
    description:
      'See what Moaiy offers today and what features are planned next.',
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
    title: 'Moaiy Security Whitepaper (Draft) | Technical Details',
    description:
      'Read the technical draft covering threat assumptions, security controls, and vulnerability reporting.',
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
    title: 'Moaiy Release Notes | What Changed',
    description:
      'See recent Moaiy updates and visit official release downloads.',
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
    title: 'Moaiy Verification Guide | Check Downloads Before Install',
    description:
      'Learn how to verify checksums and signatures so you can install Moaiy safely.',
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
    title: 'Encrypt Files on macOS with Moaiy | Step-by-Step Guide',
    description:
      'Simple steps to encrypt files on your Mac, manage keys, and share encrypted files safely.',
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
    title: 'OpenPGP Made Simple | Beginner Guide with Moaiy',
    description:
      'Learn OpenPGP basics in plain language and apply them with Moaiy.',
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
    title: 'Moaiy vs GPG Tools | Easier File Encryption',
    description:
      'Compare Moaiy with classic GPG workflows and see which is easier for everyday use.',
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
  smartcardEncryptionGuide: {
    title: 'Smartcard Encryption Guide | Hardware-Backed OpenPGP Workflows',
    description:
      'Learn practical smartcard and hardware token workflows for local file encryption, backup, and recovery.',
    canonicalPath: '/smartcard-encryption-guide/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'smartcard-encryption-guide',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Smartcard Encryption Guide', path: '/smartcard-encryption-guide/' },
      ]),
    ],
  },
};
