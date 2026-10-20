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
    | 'privacy'
    | 'terms'
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
const DEFAULT_OG_IMAGE = '/og-image.png';
const BRAND_LOGO = '/moaiy_logo.png';

const organizationSchema: SeoSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Moaiy',
  url: SITE_URL,
  logo: `${SITE_URL}${BRAND_LOGO}`,
  description:
    'Open-source project building Moaiy, a native macOS app for drag-and-drop OpenPGP file encryption.',
  email: 'support@moaiy.com',
  sameAs: ['https://github.com/moaiy-com/moaiy', 'https://x.com/moaiycom'],
};

const webSiteSchema: SeoSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Moaiy',
  url: SITE_URL,
  inLanguage: 'en-US',
  publisher: {
    '@type': 'Organization',
    name: 'Moaiy',
    url: SITE_URL,
  },
};

const softwareApplicationSchema: SeoSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Moaiy',
  applicationCategory: 'SecurityApplication',
  applicationSubCategory: 'File Encryption Software',
  operatingSystem: 'macOS',
  isAccessibleForFree: true,
  license: 'https://opensource.org/licenses/MIT',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  softwareVersion: 'Active development',
  url: SITE_URL,
  downloadUrl: 'https://github.com/moaiy-com/moaiy/releases',
  image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
  author: {
    '@type': 'Organization',
    name: 'Moaiy',
    url: SITE_URL,
  },
  featureList: [
    'Drag-and-drop OpenPGP file encryption and decryption on macOS',
    'Recipient Mode (public-key encryption) and Password Mode (symmetric passphrase encryption)',
    'Visual OpenPGP Key Manager for generating, importing, and exporting keys without terminal commands',
    'OpenPGP smart card and hardware security key (YubiKey) support',
    '100% local processing on your Mac with zero cloud uploads',
    'Free and open-source under the MIT License',
  ],
  description:
    'Moaiy is a free and open-source native macOS app for drag-and-drop OpenPGP file encryption and decryption.',
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

function techArticleSchema(params: {
  headline: string;
  description: string;
  path: string;
}): SeoSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: params.headline,
    description: params.description,
    url: `${SITE_URL}${params.path}`,
    inLanguage: 'en-US',
    author: {
      '@type': 'Organization',
      name: 'Moaiy',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Moaiy',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}${BRAND_LOGO}`,
      },
    },
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
        text: 'Moaiy is a free and open-source native macOS app that lets you encrypt and decrypt files with simple drag-and-drop steps.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to use the Terminal or command line to use Moaiy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Moaiy is designed around a clean graphical interface on macOS—key creation, file encryption, and decryption are all handled visually.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I download Moaiy safely?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Download only from the official GitHub Releases page and verify SHA-256 checksums before installing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Moaiy process plaintext on a remote server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Moaiy encrypts and decrypts all files locally on your Mac without uploading plaintext to the cloud.',
      },
    },
  ],
};

const gpgAlternativeFaqSchema: SeoSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How is Moaiy different from traditional GPG tools on macOS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Moaiy focuses on a lightweight, standalone macOS drag-and-drop window with a visual keyring and both recipient and password encryption modes, without requiring terminal commands, background daemons, or invasive Mail plugins.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Moaiy free and open source?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Moaiy is 100% free and distributed under the MIT License with public source code on GitHub.',
      },
    },
  ],
};

export const pageSeo: Record<string, SeoPageConfig> = {
  home: {
    title: 'Moaiy | Drag-and-Drop File Encryption for macOS',
    description:
      'Encrypt files on macOS with drag and drop—no command line needed. Moaiy is free, open source, and built for local privacy.',
    canonicalPath: '/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'home',
    schema: [organizationSchema, webSiteSchema, softwareApplicationSchema],
  },
  features: {
    title: 'Moaiy Features | Native macOS Drag-and-Drop Encryption',
    description:
      'Explore Moaiy on macOS: drag-and-drop OpenPGP encryption, recipient and password modes, visual key management, and smart card support.',
    canonicalPath: '/features/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'features',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Features', path: '/features/' },
      ]),
      softwareApplicationSchema,
    ],
  },
  security: {
    title: 'Moaiy Security | How Your Files Stay Protected Locally',
    description:
      'Read a plain-language security summary, then review local encryption principles, release verification, and vulnerability reporting.',
    canonicalPath: '/security/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'security',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Security', path: '/security/' },
      ]),
      techArticleSchema({
        headline: 'Moaiy Security Model and Vulnerability Reporting Policy',
        description:
          'Plain-language summary and technical overview of Moaiy local file encryption security, release verification, and coordinated disclosure.',
        path: '/security/',
      }),
    ],
  },
  docs: {
    title: 'Moaiy Docs | Visual Guides for Encrypting Files on macOS',
    description:
      'Follow simple visual guides to install Moaiy on macOS, manage keys, drag and drop files to encrypt or decrypt, and verify downloads.',
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
    title: 'Download Moaiy | Official macOS App Release',
    description:
      'Download the official Moaiy macOS app from GitHub Releases and verify the installer before opening.',
    canonicalPath: '/download/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'download',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Download', path: '/download/' },
      ]),
      softwareApplicationSchema,
    ],
  },
  about: {
    title: 'About Moaiy | Simple, Open-Source File Protection for Mac',
    description:
      'Learn the story behind Moaiy and our mission to make local OpenPGP file encryption effortless, visual, and transparent on macOS.',
    canonicalPath: '/about/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'about',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about/' },
      ]),
      organizationSchema,
    ],
  },
  privacy: {
    title: 'Privacy Policy - Moaiy',
    description: 'Privacy policy for moaiy.com and official support channels.',
    canonicalPath: '/privacy/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'privacy',
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Privacy Policy - Moaiy',
        url: 'https://moaiy.com/privacy/',
      },
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Privacy Policy', path: '/privacy/' },
      ]),
    ],
  },
  terms: {
    title: 'Terms - Moaiy',
    description: 'Terms for using moaiy.com resources and open-source releases.',
    canonicalPath: '/terms/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'terms',
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Terms - Moaiy',
        url: 'https://moaiy.com/terms/',
      },
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Terms', path: '/terms/' },
      ]),
    ],
  },
  roadmap: {
    title: 'Moaiy Roadmap | Shipped Features and Upcoming Milestones',
    description:
      'See what Moaiy offers on macOS today and what capabilities are in progress or planned next.',
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
    title: 'Moaiy Security Whitepaper (Draft) | Threat Model & Controls',
    description:
      'Read the technical draft covering local threat assumptions, security controls, and coordinated vulnerability reporting.',
    canonicalPath: '/security-whitepaper/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'security-whitepaper',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Security Whitepaper', path: '/security-whitepaper/' },
      ]),
      techArticleSchema({
        headline: 'Moaiy Security Whitepaper (Draft)',
        description:
          'Technical summary of threat model assumptions, control priorities, and vulnerability disclosure for Moaiy on macOS.',
        path: '/security-whitepaper/',
      }),
    ],
  },
  releaseNotes: {
    title: 'Moaiy Release Notes | Product & Site Milestones',
    description:
      'Review recent Moaiy product and documentation milestones and access official macOS downloads on GitHub Releases.',
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
    title: 'Moaiy Verification Guide | Check macOS Downloads Before Install',
    description:
      'Learn how to verify SHA-256 checksums and signatures before installing Moaiy on your Mac.',
    canonicalPath: '/verification/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'verification',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Verification', path: '/verification/' },
      ]),
      techArticleSchema({
        headline: 'How to Verify Moaiy macOS Downloads with SHA-256 Checksums and Signatures',
        description:
          'Step-by-step verification checklist for checking SHA-256 hashes and PGP signatures before installing Moaiy on macOS.',
        path: '/verification/',
      }),
    ],
  },
  encryptFilesOnMacos: {
    title: 'Encrypt Files on macOS with Moaiy | Visual Drag-and-Drop Guide',
    description:
      'Encrypt files on your Mac in seconds with drag and drop, visual key management, and zero command-line setup.',
    canonicalPath: '/encrypt-files-on-macos/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'encrypt-files-on-macos',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Encrypt Files on macOS', path: '/encrypt-files-on-macos/' },
      ]),
      techArticleSchema({
        headline: 'How to Encrypt Files on macOS with Drag and Drop Using Moaiy',
        description:
          'Visual 4-step workflow for encrypting files on macOS with recipient public keys or shared passwords in Moaiy.',
        path: '/encrypt-files-on-macos/',
      }),
    ],
  },
  openpgpMadeSimple: {
    title: 'OpenPGP Made Simple | Visual Beginner Guide with Moaiy',
    description:
      'Understand public keys, private keys, and passphrases in plain language and use them visually on macOS with Moaiy.',
    canonicalPath: '/openpgp-made-simple/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'openpgp-made-simple',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'OpenPGP Made Simple', path: '/openpgp-made-simple/' },
      ]),
      techArticleSchema({
        headline: 'OpenPGP Made Simple: Visual Guide to Public Keys, Private Keys, and Passphrases',
        description:
          'Beginner-friendly guide to OpenPGP concepts and how to use them visually on macOS without terminal commands.',
        path: '/openpgp-made-simple/',
      }),
    ],
  },
  gpgToolsAlternative: {
    title: 'Moaiy vs GPG Tools | Simpler macOS File Encryption',
    description:
      'Compare Moaiy’s native macOS drag-and-drop interface with traditional GPG suites and command-line workflows.',
    canonicalPath: '/gpg-tools-alternative/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'gpg-tools-alternative',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'GPG Tools Alternative', path: '/gpg-tools-alternative/' },
      ]),
      gpgAlternativeFaqSchema,
    ],
  },
  smartcardEncryptionGuide: {
    title: 'Smart Card Encryption Guide | Hardware-Backed OpenPGP on macOS',
    description:
      'Learn practical smart card and hardware token workflows for local file encryption, backup, and recovery on macOS.',
    canonicalPath: '/smartcard-encryption-guide/',
    ogImage: DEFAULT_OG_IMAGE,
    currentPage: 'smartcard-encryption-guide',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Smart Card Encryption Guide', path: '/smartcard-encryption-guide/' },
      ]),
      techArticleSchema({
        headline: 'Smart Card Encryption Guide: Using OpenPGP Hardware Tokens with Moaiy on macOS',
        description:
          'Best practices for pairing YubiKey and OpenPGP smart cards with Moaiy on macOS, including PIN management and recovery planning.',
        path: '/smartcard-encryption-guide/',
      }),
    ],
  },
};
