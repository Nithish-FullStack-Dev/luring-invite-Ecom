// data\products.ts
export interface Product {
  id: string;
  title: string;
  slug: string;
  category: "ai-video-invites" | "digital-invites";
  collection: string;
  collectionSlug: string;
  priceFrom: number;
  tags: string[];
  deliveryTime: "24h" | "48h" | "72h";
  styles: ("Royal" | "Minimal" | "Modern" | "Traditional" | "Cinematic" | "Poetic" | "Emotional" | "Vibrant"
    | "Elegant" | "Luxury" | "Animated" | "Storytelling" | "Floral" | "Islamic" | "Travel" | "Illustrated"
    | "Playful" | "Fun" | "Cute" | "Creative" | "Romantic" | "Celebration")[];
  languages: ("Telugu" | "Hindi" | "English" | "Urdu" | "Punjabi")[];
  thumbnail: string;
  previewImages: string[];
  bestSeller: boolean;
  isNew: boolean;
  description: string;
  whatIncluded: string[];
  revisionPolicy: string;
  deliverables: string[];

  // ✅ Add this
  video?: ProductVideo;
  pdf?: string;
  // New fields for enhanced filtering
  religion?: ("Hindu" | "Muslim" | "Christian" | "Sikh" | "Jain" | "Other")[];
  region?: ("South Indian" | "North Indian" | "East Indian" | "West Indian" | "Other")[];
  subOccasion?: string[]; // e.g., ["1st Anniversary", "Silver Jubilee"] or ["1st Birthday", "Sweet 16"]
}


export interface Collection {
  id: string;
  title: string;
  slug: string;
  category: 'ai-video-invites' | 'digital-invites';
  description: string;
  thumbnail: string;
  productCount: number;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  description: string;
  collections: string[];
  thumbnail: string;
}

export const categories: Category[] = [
  {
    id: 'cat-1',
    title: 'AI Video Invites',
    slug: 'ai-video-invites',
    description: 'Stunning AI-powered video invitations that bring your special moments to life with cutting-edge technology.',
    collections: ['3d-ai-video', 'storyboard'],
    thumbnail: '/images/AI.jpeg',
  },
  {
    id: 'cat-2',
    title: 'Digital Invites',
    slug: 'digital-invites',
    description: 'Elegant digital invitations crafted with love for every occasion.',
    collections: ['pdf-invites', 'wedding-invites', 'anniversary', 'house-warming', 'birthday', 'baby-showers', 'stationery', 'logo', 'caricature'],
    thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
  },
];

export const collections: Collection[] = [
  // AI Video Invites Collections
  {
    id: 'col-1',
    title: '3D AI Video',
    slug: '3d-ai-video',
    category: 'ai-video-invites',
    description: 'Immersive 3D animated invitations powered by artificial intelligence.',
    thumbnail: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80',
    productCount: 5,
  },
  {
    id: 'col-2',
    title: 'Storyboard',
    slug: 'storyboard',
    category: 'ai-video-invites',
    description: 'Narrative-driven video invitations that tell your love story.',
    thumbnail: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80',
    productCount: 4,
  },
  // Digital Invites Collections
  {
    id: 'col-3',
    title: 'PDF Invites',
    slug: 'pdf-invites',
    category: 'digital-invites',
    description: 'Beautifully designed PDF invitations ready to share.',
    thumbnail: '/assets/wedding.jpeg',
    productCount: 6,
  },
  {
    id: 'col-4',
    title: 'Wedding Invites',
    slug: 'wedding-invites',
    category: 'digital-invites',
    description: 'Timeless wedding invitations for your special day.',
    thumbnail: '/assets/weddings.jpg',
    productCount: 8,
  },
  {
    id: 'col-5',
    title: 'Anniversary',
    slug: 'anniversary',
    category: 'digital-invites',
    description: 'Celebrate years of love with elegant anniversary invites.',
    thumbnail: '/assets/Anniversary.jpg',
    productCount: 4,
  },
  {
    id: 'col-6',
    title: 'House Warming',
    slug: 'house-warming',
    category: 'digital-invites',
    description: 'Welcome guests to your new home in style.',
    thumbnail: '/assets/Housewarming.jpg',
    productCount: 3,
  },
  {
    id: 'col-7',
    title: 'Birthday',
    slug: 'birthday',
    category: 'digital-invites',
    description: 'Make birthdays memorable with custom invitations.',
    thumbnail: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
    productCount: 5,
  },
  {
    id: 'col-8',
    title: 'Baby Showers',
    slug: 'baby-showers',
    category: 'digital-invites',
    description: 'Adorable invites to celebrate the little one.',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    productCount: 4,
  },
  {
    id: 'col-9',
    title: 'Stationery',
    slug: 'stationery',
    category: 'digital-invites',
    description: 'Complete wedding stationery suites and sets.',
    thumbnail: '/images/stationary.jpeg',
    productCount: 3,
  },
  {
    id: 'col-10',
    title: 'Logo Design',
    slug: 'logo',
    category: 'digital-invites',
    description: 'Custom couple logos and wedding monograms.',
    thumbnail: '/images/logos.jpeg',
    productCount: 4,
  },
  {
    id: 'col-11',
    title: 'Caricature',
    slug: 'caricature',
    category: 'digital-invites',
    description: 'Fun and personalized caricature invitations.',
    thumbnail: '/images/Caricature.jpeg',
    productCount: 3,
  },
  {
    id: 'col-12',
    title: 'AI Wedding Invites',
    slug: 'wedding-invites',
    category: 'ai-video-invites',
    description: 'Timeless wedding invitations for your special day.',
    thumbnail: '/images/AI.jpeg',
    productCount: 8,
  },
  {
    id: 'col-13',
    title: 'Anniversary-AI Invites',
    slug: 'anniversary',
    category: 'ai-video-invites',
    description: 'Celebrate years of love with elegant anniversary invites.',
    thumbnail: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80',
    productCount: 4,
  },
  {
    id: 'col-14',
    title: 'House Warming-AI Invites',
    slug: 'house-warming-ai',
    category: 'ai-video-invites',
    description: 'Welcome guests to your new home in style.',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    productCount: 3,
  },
  {
    id: 'col-15',
    title: 'Birthday-AI Invites',
    slug: 'birthday-ai',
    category: 'ai-video-invites',
    description: 'Make birthdays memorable with custom invitations.',
    thumbnail: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
    productCount: 5,
  },
  {
    id: 'col-16',
    title: 'Baby Showers-AI Invites',
    slug: 'baby-showers',
    category: 'ai-video-invites',
    description: 'Adorable invites to celebrate the little one.',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    productCount: 4,
  },
];


//video and digital products
export type VideoPlatform = "local" | "youtube" | "instagram" | "pinterest";

export interface ProductVideo {
  platform: VideoPlatform;
  url: string;        // IG/YT/Pinterest link OR local mp4 path like "/videos/demo.mp4"
  thumbnail?: string; // optional poster/preview override (you can skip this)
}

export const products: Product[] = [
  {
    id: "prod-1",
    title: "Royal 3D Palace Invitation",
    slug: "royal-3d-palace-invitation",
    category: "ai-video-invites",
    collection: "3D AI Video",
    collectionSlug: "3d-ai-video",
    priceFrom: 4999,
    tags: ["Premium", "AI Powered", "3D Animation"],
    deliveryTime: "72h",
    styles: ["Royal", "Cinematic"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80",
    ],
    bestSeller: true,
    isNew: false,
    description:
      "Experience the grandeur of royalty with our stunning 3D palace invitation. AI-crafted visuals bring your wedding story to life.",
    whatIncluded: [
      "60-90 second video",
      "Custom 3D palace environment",
      "AI voice narration",
      "Background music",
      "2 revision rounds",
    ],
    revisionPolicy:
      "Up to 2 revision rounds included. Additional revisions at ₹500 each.",
    deliverables: [
      "MP4 video (1080p)",
      "WhatsApp optimized version",
      "Instagram Reel version",
    ],

    // ✅ VIDEO SUPPORT (this enables play button in Best Sellers)
    video: {
      platform: "local", // local | youtube | instagram | pinterest
      url: "https://youtube.com/shorts/nXvMTCadXEc?si=cU_o-wRQqLNB2OUg",
      // thumbnail: "/videos/royal-3d-palace-poster.jpg" // optional
    },
  },

  {
    id: 'prod-2',
    title: 'Modern Minimal AI Video',
    slug: 'modern-minimal-ai-video',
    category: 'ai-video-invites',
    collection: '3D AI Video',
    collectionSlug: '3d-ai-video',
    priceFrom: 3499,
    tags: ['Minimal', 'AI Powered', 'Trending'],
    deliveryTime: '48h',
    styles: ['Minimal', 'Modern'],
    languages: ['Hindi', 'English'],
    thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    ],
    bestSeller: true,
    isNew: true,
    description: 'Clean, contemporary design meets AI innovation. Perfect for modern couples who appreciate understated elegance.',
    whatIncluded: ['45-60 second video', 'Minimal animation style', 'Typography focus', 'Background music', '1 revision round'],
    revisionPolicy: '1 revision round included. Additional revisions at ₹500 each.',
    deliverables: ['MP4 video (1080p)', 'WhatsApp optimized version'],
    video: {
      platform: "youtube", // local | youtube | instagram | pinterest
      url: "https://youtube.com/shorts/nXvMTCadXEc?si=cU_o-wRQqLNB2OUg",
      // thumbnail: "/videos/royal-3d-palace-poster.jpg" // optional
    },
  },
  {
    id: 'prod-3',
    title: 'Floral Garden 3D Invite',
    slug: 'floral-garden-3d-invite',
    category: 'ai-video-invites',
    collection: '3D AI Video',
    collectionSlug: '3d-ai-video',
    priceFrom: 3999,
    tags: ['Floral', 'Romantic', '3D'],
    deliveryTime: '72h',
    styles: ['Floral', 'Traditional'],
    languages: ['Telugu', 'Hindi', 'English'],
    thumbnail: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
    ],
    bestSeller: false,
    isNew: false,
    description: 'A blooming garden of love with realistic 3D flowers and butterflies. Perfect for nature-loving couples.',
    whatIncluded: ['60 second video', '3D floral environment', 'Butterfly animations', 'Romantic music', '2 revision rounds'],
    revisionPolicy: 'Up to 2 revision rounds included.',
    deliverables: ['MP4 video (1080p)', 'WhatsApp optimized version'],
  },
  // Storyboard Products
  {
    id: 'prod-4',
    title: 'Love Story Timeline',
    slug: 'love-story-timeline',
    category: 'ai-video-invites',
    collection: 'Storyboard',
    collectionSlug: 'storyboard',
    priceFrom: 5499,
    tags: ['Story', 'Personal', 'Cinematic'],
    deliveryTime: '72h',
    styles: ['Cinematic', 'Modern'],
    languages: ['Telugu', 'Hindi', 'English'],
    thumbnail: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80',
    ],
    bestSeller: true,
    isNew: false,
    description: 'Tell your love story from first meeting to wedding day. A cinematic journey through your relationship milestones.',
    whatIncluded: ['2-3 minute video', 'Custom storyboard', 'Photo integration', 'Voice narration option', '3 revision rounds'],
    revisionPolicy: 'Up to 3 revision rounds included.',
    deliverables: ['MP4 video (1080p)', 'YouTube version', 'WhatsApp version'],
  },
  // Wedding Invites
  // Birthday
  {
    id: 'prod-8',
    title: 'Kids Birthday Bash',
    slug: 'kids-birthday-bash',
    category: 'digital-invites',
    collection: 'Birthday',
    collectionSlug: 'birthday',
    priceFrom: 799,
    tags: ['Kids', 'Fun', 'Colorful'],
    deliveryTime: '24h',
    styles: ['Modern', 'Floral'],
    languages: ['Telugu', 'Hindi', 'English'],
    thumbnail: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
    ],
    bestSeller: true,
    isNew: false,
    description: 'Vibrant and playful birthday invitations perfect for your little one\'s special day.',
    whatIncluded: ['Digital invite', 'Party details', '1 revision'],
    revisionPolicy: '1 revision included.',
    deliverables: ['PDF', 'WhatsApp image'],
    subOccasion: ['1st-birthday', 'kids-birthday'],
    video: {
      platform: "youtube", // local | youtube | instagram | pinterest
      url: "https://youtube.com/shorts/nXvMTCadXEc?si=cU_o-wRQqLNB2OUg",
      // thumbnail: "/videos/royal-3d-palace-poster.jpg" // optional
    },
  },
  // Anniversary
  {
    id: 'prod-9',
    title: 'Silver Jubilee Celebration',
    slug: 'silver-jubilee-celebration',
    category: 'digital-invites',
    collection: 'Anniversary',
    collectionSlug: 'anniversary',
    priceFrom: 1299,
    tags: ['Anniversary', 'Elegant', 'Silver'],
    deliveryTime: '24h',
    styles: ['Royal', 'Traditional'],
    languages: ['Telugu', 'Hindi', 'English'],
    thumbnail: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80',
    ],
    bestSeller: false,
    isNew: false,
    description: 'Celebrate 25 years of love with an elegant silver-themed anniversary invitation.',
    whatIncluded: ['Digital invite', 'Event details', '1 revision'],
    revisionPolicy: '1 revision included.',
    deliverables: ['PDF', 'WhatsApp image'],
    subOccasion: ['silver-jubilee'],
  },
  // Logo
  {
    id: 'prod-10',
    title: 'Couple Monogram Logo',
    slug: 'couple-monogram-logo',
    category: 'digital-invites',
    collection: 'Logo Design',
    collectionSlug: 'logo',
    priceFrom: 1999,
    tags: ['Logo', 'Custom', 'Monogram'],
    deliveryTime: '48h',
    styles: ['Modern', 'Minimal', 'Royal'],
    languages: ['English'],
    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80',
    ],
    bestSeller: true,
    isNew: false,
    description: 'A unique monogram combining your initials into a beautiful wedding logo.',
    whatIncluded: ['3 logo concepts', 'Final logo files', 'Color variations', '2 revisions'],
    revisionPolicy: '2 revision rounds included.',
    deliverables: ['PNG', 'SVG', 'PDF', 'Color + B&W versions'],
    subOccasion: ["wedding-stationery"]
  },
  // Caricature
  {
    id: 'prod-11',
    title: 'Fun Couple Caricature',
    slug: 'fun-couple-caricature',
    category: 'digital-invites',
    collection: 'Caricature',
    collectionSlug: 'caricature',
    priceFrom: 2499,
    tags: ['Caricature', 'Fun', 'Custom'],
    deliveryTime: '72h',
    styles: ['Modern', 'Floral'],
    languages: ['Telugu', 'Hindi', 'English'],
    thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    ],
    bestSeller: true,
    isNew: true,
    description: 'Get a custom caricature of you and your partner, perfect for invites and wedding decor.',
    whatIncluded: ['Custom couple caricature', 'Background theme', 'Outfit customization', '2 revisions'],
    revisionPolicy: '2 revision rounds included.',
    deliverables: ['High-res PNG', 'Print-ready PDF'],
    subOccasion: ["wedding-invite", "reception-invite"]
  },
  // House Warming
  {
    id: 'prod-12',
    title: 'New Home Celebration',
    slug: 'new-home-celebration',
    category: 'digital-invites',
    collection: 'House Warming',
    collectionSlug: 'house-warming',
    priceFrom: 899,
    tags: ['House Warming', 'Traditional', 'Auspicious'],
    deliveryTime: '24h',
    styles: ['Traditional', 'Modern'],
    languages: ['Telugu', 'Hindi', 'English'],
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ],
    bestSeller: false,
    isNew: false,
    description: 'Welcome guests to your new home with a beautifully designed griha pravesh invitation.',
    whatIncluded: ['Digital invite', 'Pooja details', '1 revision'],
    revisionPolicy: '1 revision included.',
    deliverables: ['PDF', 'WhatsApp image'],
    religion: ['Hindu'],
    region: ['South Indian'],
    subOccasion: ["griha-pravesh", "new-home"]
  },
  // Baby Shower
  {
    id: 'prod-13',
    title: 'Cute Baby Shower',
    slug: 'cute-baby-shower',
    category: 'digital-invites',
    collection: 'Baby Showers',
    collectionSlug: 'baby-showers',
    priceFrom: 899,
    tags: ['Baby Shower', 'Cute', 'Adorable'],
    deliveryTime: '24h',
    styles: ['Modern', 'Floral'],
    languages: ['Telugu', 'Hindi', 'English'],
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    ],
    bestSeller: true,
    isNew: false,
    description: 'Adorable baby shower invitations with cute illustrations and soft colors.',
    whatIncluded: ['Digital invite', 'Party details', '1 revision'],
    revisionPolicy: '1 revision included.',
    deliverables: ['PDF', 'WhatsApp image'],
    subOccasion: ["boy", "girl", "gender-neutral"]
  },
  // PDF Invites
  {
    id: "prod-14",
    title: "Elegant PDF Wedding Card",
    slug: "elegant-pdf-wedding-card",
    category: "digital-invites",
    collection: "PDF Invites",
    collectionSlug: "pdf-invites",
    priceFrom: 699,
    tags: ["PDF", "Quick", "Budget"],
    deliveryTime: "24h",
    styles: ["Traditional", "Minimal"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/PDF/sk-pdf-groom.jpg",

    // ✅ PDF FILE
    pdf: "/PDF/sk-pdf-groom.pdf",

    previewImages: [],
    bestSeller: false,
    isNew: false,
    description: "Simple, elegant, and ready in 24 hours.",
    whatIncluded: ["PDF invite card", "1 revision"],
    revisionPolicy: "1 revision included.",
    deliverables: ["PDF"],
  },

  // Stationery
  {
    id: 'prod-15',
    title: 'Complete Wedding Stationery',
    slug: 'complete-wedding-stationery',
    category: 'digital-invites',
    collection: 'Stationery',
    collectionSlug: 'stationery',
    priceFrom: 3499,
    tags: ['Complete', 'Premium', 'Suite'],
    deliveryTime: '72h',
    styles: ['Royal', 'Floral', 'Traditional'],
    languages: ['Telugu', 'Hindi', 'English'],
    thumbnail: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80',
    ],
    bestSeller: true,
    isNew: false,
    description: 'Complete wedding stationery suite including invites, programs, menus, and more.',
    whatIncluded: ['Main invite', 'Save the date', 'RSVP', 'Menu', 'Program', 'Thank you', '3 revisions'],
    revisionPolicy: '3 revision rounds included.',
    deliverables: ['All items in PDF', 'Print-ready files'],
    religion: ['Christian'],
    region: ['South Indian'],
    subOccasion: ["wedding-stationery", "wardrobe-planner", "reception-invite"]
  },
  /* =====================================================
   AI VIDEO – STORYBOARD / EMOTIONAL / WEDDING
===================================================== */

  {
    id: "prod-16",
    title: "Bride Side Story Wedding Invite",
    slug: "bride-side-story-wedding-invite",
    category: "ai-video-invites",
    collection: "Storyboard",
    collectionSlug: "storyboard",
    priceFrom: 5999,
    tags: ["Bride Side", "Emotional", "Storytelling", "Cinematic"],
    deliveryTime: "72h",
    styles: ["Poetic", "Emotional"],
    languages: ["Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    ],
    bestSeller: true,
    isNew: true,
    description:
      "A deeply emotional bride-side wedding invitation showcasing her journey, family, and love through poetic storytelling.",
    whatIncluded: [
      "60–90 sec story video",
      "Bride-side narration",
      "Cinematic visuals",
      "Music",
      "2 revisions",
    ],
    revisionPolicy: "Up to 2 revision rounds included.",
    deliverables: ["MP4", "WhatsApp Reel", "Instagram Reel"],
    video: {
      platform: "youtube",
      url: "https://youtube.com/shorts/VUaUX0wQcok",
    },
  },

  {
    id: "prod-17",
    title: "Indian Cultural Wedding Video Invite",
    slug: "indian-cultural-wedding-video-invite",
    category: "ai-video-invites",
    collection: "AI Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 4499,
    tags: ["Indian Wedding", "Punjabi", "Sikh", "Traditional"],
    deliveryTime: "48h",
    styles: ["Traditional", "Vibrant"],
    languages: ["Hindi", "English", "Punjabi"],
    thumbnail: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    ],
    bestSeller: false,
    isNew: false,
    description:
      "A rich Indian wedding invitation featuring cultural patterns, rituals, and vibrant visuals.",
    whatIncluded: [
      "Animated invite video",
      "Cultural motifs",
      "Event details",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["MP4"],
    video: {
      platform: "youtube",
      url: "https://youtube.com/shorts/RhbBq0_Q_1c",
    },
  },

  {
    id: "prod-18",
    title: "Complete Wedding Ritual Guide Video",
    slug: "wedding-ritual-guide-video",
    category: "ai-video-invites",
    collection: "AI Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 4999,
    tags: ["Wedding Rituals", "Ceremony Guide", "Traditional"],
    deliveryTime: "72h",
    styles: ["Traditional", "Elegant"],
    languages: ["Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    ],
    bestSeller: false,
    isNew: false,
    description:
      "A structured digital invite that guides guests through every wedding ritual clearly.",
    whatIncluded: [
      "All rituals breakdown",
      "Timings & flow",
      "Elegant animation",
      "2 revisions",
    ],
    revisionPolicy: "2 revision rounds included.",
    deliverables: ["MP4"],
    video: {
      platform: "youtube",
      url: "https://youtube.com/shorts/ImuVId7u6L8",
    },
  },

  {
    id: "prod-19",
    title: "All-in-One Wedding Celebration Video",
    slug: "all-in-one-wedding-celebration-video",
    category: "ai-video-invites",
    collection: "AI Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 6999,
    tags: ["All Events", "Luxury", "Premium"],
    deliveryTime: "72h",
    styles: ["Luxury", "Modern"],
    languages: ["Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80"
    ],
    bestSeller: false,
    isNew: false,
    description:
      "One complete AI-powered wedding invitation covering every event in a single experience.",
    whatIncluded: [
      "Haldi to Reception",
      "Custom characters",
      "Event flow",
      "3 revisions",
    ],
    revisionPolicy: "3 revision rounds included.",
    deliverables: ["MP4", "WhatsApp"],
    video: {
      platform: "youtube",
      url: "https://youtube.com/shorts/RmnkLZ-Ov5w",
    },
  },

  {
    id: "prod-20",
    title: "AI Digital Invite for Special Occasions",
    slug: "ai-digital-invite-special-occasions",
    category: "ai-video-invites",
    collection: "Birthday-AI Invites",
    collectionSlug: "birthday",
    priceFrom: 2999,
    tags: ["AI Invite", "Birthday", "Housewarming", "Engagement"],
    deliveryTime: "48h",
    styles: ["Modern", "Animated"],
    languages: ["Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80"
    ],
    bestSeller: false,
    isNew: true,
    description:
      "AI-powered digital invitation videos for weddings, birthdays, and celebrations.",
    whatIncluded: ["Custom video", "Music", "1 revision"],
    revisionPolicy: "1 revision included.",
    deliverables: ["MP4"],
    video: {
      platform: "youtube",
      url: "https://youtube.com/shorts/TjfS3ntM5-Y",
    },
  },

  {
    id: "prod-21",
    title: "Love Story Wedding Invitation Video",
    slug: "love-story-wedding-invitation-video",
    category: "ai-video-invites",
    collection: "Storyboard",
    collectionSlug: "storyboard",
    priceFrom: 5499,
    tags: ["Love Story", "Chat to Shaadi", "Cinematic"],
    deliveryTime: "72h",
    styles: ["Storytelling", "Cinematic"],
    languages: ["Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80"
    ],
    bestSeller: true,
    isNew: false,
    description:
      "A cinematic love story invitation from first chat to wedding day.",
    whatIncluded: [
      "Love story",
      "Haldi + Sangeet + Wedding",
      "Custom music",
      "3 revisions",
    ],
    revisionPolicy: "Up to 3 revision rounds included.",
    deliverables: ["MP4"],
    video: {
      platform: "youtube",
      url: "https://youtube.com/shorts/DdfYvphGJq8",
    },
  },
  {
    id: "prod-22",
    title: "Save The Date Animated Invite",
    slug: "save-the-date-animated-invite",
    category: "digital-invites",
    collection: "Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 1499,
    tags: ["Save The Date", "Modern", "Elegant"],
    deliveryTime: "24h",
    styles: ["Minimal", "Floral"],
    languages: ["Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80"
    ],
    bestSeller: false,
    isNew: false,
    description:
      "A modern animated Save The Date invite designed for reels and WhatsApp.",
    whatIncluded: ["Animated Save The Date", "1 revision"],
    revisionPolicy: "1 revision included.",
    deliverables: ["MP4"],

    video: {
      platform: "youtube",
      url: "https://youtube.com/shorts/u5DHR8RrWNk",
    },
    subOccasion: ["save-the-date"]
  },

  {
    id: "prod-23",
    title: "Muslim Nikah Digital Video Invite",
    slug: "muslim-nikah-digital-video-invite",
    category: "digital-invites",
    collection: "Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 1999,
    tags: ["Nikah", "Muslim Wedding", "Islamic"],
    deliveryTime: "48h",
    styles: ["Elegant", "Islamic"],
    languages: ["Urdu", "Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80"
    ],
    bestSeller: false,
    isNew: false,
    description:
      "A graceful Islamic wedding invitation with Quranic verses and elegant visuals.",
    whatIncluded: ["Nikah details", "Islamic design", "Music"],
    revisionPolicy: "1 revision included.",
    deliverables: ["MP4"],
    video: {
      platform: "youtube",
      url: "https://youtu.be/Oz6EYL16S3k",
    },
    religion: ["Muslim"],
    region: ["North Indian"],
    subOccasion: ["wedding-invite"]
  },
  {
    id: "prod-24",
    title: "Destination Wedding Video Invite",
    slug: "destination-wedding-video-invite",
    category: "ai-video-invites",
    collection: "AI Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 5999,
    tags: ["Destination Wedding", "Travel Theme", "Luxury"],
    deliveryTime: "72h",
    styles: ["Cinematic", "Travel"],
    languages: ["Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80"
    ],
    bestSeller: false,
    isNew: false,
    description:
      "A travel-inspired destination wedding invitation filled with romance and wanderlust.",
    whatIncluded: ["Destination visuals", "Itinerary", "2 revisions"],
    revisionPolicy: "2 revision rounds included.",
    deliverables: ["MP4"],
    video: {
      platform: "youtube",
      url: "https://youtu.be/SHwLMFu1Flo",
    },
  },

  /* =====================================================
     CARICATURE INVITES
  ===================================================== */

  {
    id: "prod-25",
    title: "Caricature Wedding Invitation Video",
    slug: "caricature-wedding-invitation-video",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 2499,
    tags: ["Caricature", "Fun", "Animated"],
    deliveryTime: "72h",
    styles: ["Illustrated", "Playful"],
    languages: ["Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80"
    ],
    bestSeller: false,
    isNew: false,
    description:
      "A playful caricature-style wedding invitation covering all ceremonies.",
    whatIncluded: ["Custom caricatures", "Event flow", "2 revisions"],
    revisionPolicy: "2 revision rounds included.",
    deliverables: ["MP4"],
    video: {
      platform: "youtube",
      url: "https://youtu.be/nqkD7k4BaSY",
    },
  },

  {
    id: "prod-26",
    title: "Caricature Save The Date Invite",
    slug: "caricature-save-the-date-invite",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1999,
    tags: ["Caricature", "Save The Date"],
    deliveryTime: "48h",
    styles: ["Fun", "Illustrated"],
    languages: ["Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80"
    ],
    bestSeller: false,
    isNew: false,
    description:
      "A fun caricature Save The Date invitation to begin your wedding journey.",
    whatIncluded: ["Caricature art", "Animated date"],
    revisionPolicy: "1 revision included.",
    deliverables: ["MP4"],
    video: {
      platform: "youtube",
      url: "https://youtu.be/lD8-jmnGQZg",
    },
  },

  {
    id: "prod-27",
    title: "Royal Rajasthani Caricature Wedding",
    slug: "royal-rajasthani-caricature-wedding",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 3499,
    tags: ["Caricature", "Royal", "Rajasthani"],
    deliveryTime: "72h",
    styles: ["Royal", "Traditional"],
    languages: ["Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80"
    ],
    bestSeller: false,
    isNew: false,
    description:
      "A royal Rajasthani caricature wedding invitation with grand visuals.",
    whatIncluded: ["Reception & Phere", "Custom scenes"],
    revisionPolicy: "1 revision included.",
    deliverables: ["MP4"],
    video: {
      platform: "youtube",
      url: "https://youtu.be/VxAC6-1YKDQ",
    },
  },
  // anniversary
  {
    id: "prod-28",
    title: "Golden Anniversary Invitation Video",
    slug: "golden-anniversary-invitation-video",
    category: "digital-invites",
    collection: "Anniversary",
    collectionSlug: "anniversary",
    priceFrom: 1999,
    tags: ["Anniversary", "Golden", "Elegant"],
    deliveryTime: "48h",
    styles: ["Elegant"],
    languages: ["Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80"
    ],
    bestSeller: false,
    isNew: false,
    description:
      "An elegant golden-themed anniversary invitation video to celebrate 50 years of love.",
    whatIncluded: ["Anniversary details", "Golden visuals", "1 revision"],
    revisionPolicy: "1 revision included.",
    deliverables: ["MP4"],
    video: {
      platform: "youtube",
      url: "https://youtu.be/foDtNrodwyo?si=uCw_Whi2Hdg85L_1",
    },
    subOccasion: ["anniversary"]
  },
  {
    id: "prod-29",
    title: "Romantic Anniversary Story Invite",
    slug: "romantic-anniversary-story-invite",
    category: "digital-invites",
    collection: "Anniversary",
    collectionSlug: "anniversary",
    priceFrom: 2499,
    tags: ["Anniversary", "Romantic", "Storytelling"],
    deliveryTime: "72h",
    styles: ["Storytelling"],
    languages: ["Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80"
    ],
    bestSeller: false,
    isNew: false,
    description:
      "A romantic anniversary invitation video narrating your love story over the years.",
    whatIncluded: ["Love story narration", "Anniversary details", "2 revisions"],
    revisionPolicy: "2 revision rounds included.",
    deliverables: ["MP4"],
    video: {
      platform: "youtube",
      url: "https://youtu.be/Wpqzn44cVQk?si=fMPGlArtObA3YlbM",
    },
    subOccasion: ["anniversary", "silver-jubilee"]
  },
  {
    id: "prod-30",
    title: "Anniversary Celebration Highlights",
    slug: "anniversary-celebration-highlights",
    category: "digital-invites",
    collection: "Anniversary",
    collectionSlug: "anniversary",
    priceFrom: 2999,
    tags: ["Anniversary", "Celebration", "Highlights"],
    deliveryTime: "72h",
    styles: ["Emotional"],
    languages: ["Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80"
    ],
    bestSeller: false,
    isNew: false,
    description:
      "A vibrant anniversary invitation video showcasing highlights from your celebration.",
    whatIncluded: ["Event highlights", "Guest messages", "2 revisions"],
    revisionPolicy: "2 revision rounds included.",
    deliverables: ["MP4"],
    video: {
      platform: "youtube",
      url: "https://youtu.be/bLBCzMAcINo?si=uq5LpewQcgQwMWm9",
    },
    subOccasion: ["anniversary", "golden-jubilee"]
  },
  {
    id: "prod-31",
    title: "Customized Anniversary Invite Video",
    slug: "customized-anniversary-invite-video",
    category: "digital-invites",
    collection: "Anniversary",
    collectionSlug: "anniversary",
    priceFrom: 3499,
    tags: ["Anniversary", "Customized", "Personalized"],
    deliveryTime: "72h",
    styles: ["Emotional"],
    languages: ["Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80"
    ],
    bestSeller: false,
    isNew: false,
    description:
      "A fully customized anniversary invitation video tailored to your preferences and story.",
    whatIncluded: ["Custom themes", "Personal messages", "3 revisions"],
    revisionPolicy: "3 revision rounds included.",
    deliverables: ["MP4"],
    video: {
      platform: "youtube",
      url: "https://youtu.be/nONtlAj4zj8?si=fbeUx4E1ls3q_qNm",
    },
    subOccasion: ["anniversary", "golden-jubilee"]
  },
  {
    id: "prod-32",
    title: "Traditional PDF Wedding Invitation",
    slug: "traditional-pdf-wedding-invitation",
    category: "digital-invites",
    collection: "PDF Invites",
    collectionSlug: "pdf-invites",
    priceFrom: 699,
    tags: ["PDF", "Traditional", "Budget"],
    deliveryTime: "24h",
    styles: ["Traditional", "Minimal"],
    languages: ["Telugu", "Hindi", "English"],

    thumbnail: "/PDF/TA-WEDDING-INVITE.jpg",

    pdf: "/PDF/TA-WEDDING-INVITE.pdf",

    previewImages: [],
    bestSeller: false,
    isNew: false,

    description:
      "A classic traditional wedding invitation designed with elegance, perfect for quick sharing on WhatsApp.",

    whatIncluded: [
      "Traditional PDF wedding card",
      "Event details layout",
      "1 revision round",
    ],

    revisionPolicy: "1 revision round included.",

    deliverables: ["Watermarked PDF preview", "Final PDF after approval"],
  },

  {
    id: "prod-33",
    title: "Bride Side Traditional PDF Wedding Invitation",
    slug: "bride-side-traditional-pdf-wedding-invitation",
    category: "digital-invites",
    collection: "PDF Invites",
    collectionSlug: "pdf-invites",
    priceFrom: 699,
    tags: ["PDF", "Bride Side", "Traditional", "Elegant"],
    deliveryTime: "24h",
    styles: ["Traditional", "Elegant"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection listing thumbnail
    thumbnail: "/PDF/PS-invite-Bride-side.jpg",

    // ✅ Watermarked preview PDF
    pdf: "/PDF/PS-invite-Bride-side.pdf",

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "A graceful bride-side themed traditional wedding invitation designed with floral elements and cultural elegance, perfect for sharing digitally with family and friends.",

    whatIncluded: [
      "Bride-side themed PDF wedding card",
      "Customized names and event details",
      "Elegant traditional layout",
      "1 revision round",
    ],

    revisionPolicy: "1 revision round included.",

    deliverables: [
      "Watermarked PDF preview",
      "Final high-quality PDF after approval",
    ],
  },
  {
    id: "prod-34",
    title: "Housewarming Caricature Video Invitation",
    slug: "housewarming-caricature-video-invitation",
    category: "digital-invites",
    collection: "House Warming",
    collectionSlug: "house-warming",
    priceFrom: 1999,
    tags: ["House Warming", "Caricature", "Fun", "Personalized"],
    deliveryTime: "72h",
    styles: ["Illustrated", "Playful", "Modern"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection thumbnail
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",

    // ✅ Video preview
    video: {
      platform: "youtube",
      url: "https://youtu.be/Zy3yY2AYWFc?si=wZlDckCtSRHjZwtw",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "A fun and personalized housewarming caricature video invitation that warmly welcomes your loved ones to your new home. Designed to turn moments into memories with joyful visuals and customized characters.",

    whatIncluded: [
      "Custom couple or family caricature",
      "House theme illustration",
      "Animated welcome scenes",
      "Background music",
      "Event details integration",
      "1 revision round",
    ],

    revisionPolicy: "1 revision round included. Additional revisions at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
    ],

    subOccasion: ["house-warming", "griha-pravesh"],
  },
  {
    id: "prod-104",
    title: "Classic Budget PDF Wedding Invitation",
    slug: "classic-budget-pdf-wedding-invitation",
    category: "digital-invites",
    collection: "PDF Invites",
    collectionSlug: "pdf-invites",
    priceFrom: 699,
    tags: ["PDF", "Classic", "Budget", "Quick"],
    deliveryTime: "24h",
    styles: ["Traditional", "Minimal"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection thumbnail
    thumbnail: "/PDF/BC-Invite.jpeg",

    // ✅ Preview-only PDF (no download)
    pdf: "/PDF/BC-Invite.pdf",

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "A clean and classic PDF wedding invitation ideal for quick sharing. Designed with simplicity and elegance, perfect for couples looking for a budget-friendly digital wedding card.",

    whatIncluded: [
      "Classic PDF wedding invitation",
      "Names and event details customization",
      "Clean layout design",
      "1 revision round",
    ],

    revisionPolicy: "1 revision round included.",

    deliverables: [
      "Watermarked PDF preview",
      "Final high-quality PDF after approval",
    ],
  },

  {
    id: "prod-35",
    title: "Caricature Housewarming Celebration Video Invite",
    slug: "caricature-housewarming-celebration-video-invite",
    category: "digital-invites",
    collection: "House Warming",
    collectionSlug: "house-warming",
    priceFrom: 2199,
    tags: ["House Warming", "Caricature", "Animated", "Fun"],
    deliveryTime: "72h",
    styles: ["Illustrated", "Playful", "Modern"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Listing thumbnail
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",

    // ✅ Video preview
    video: {
      platform: "youtube",
      url: "https://youtu.be/wAsVQTWqEMM?si=FQr6Kd_tl4DobTeK",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Step into your Home Sweet Home with a joyful caricature housewarming video invitation. A whimsical animated experience that turns your new beginning into a celebration filled with smiles, color, and warmth.",

    whatIncluded: [
      "Personalized caricature characters",
      "Home-themed illustrated scenes",
      "Animated welcome moments",
      "Background music",
      "Event details integration",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp share version",
      "Instagram Reel format",
    ],

    subOccasion: ["house-warming", "griha-pravesh", "new-home"],
  },
  {
    id: "prod-36",
    title: "Elegant Animated Housewarming E-Invitation",
    slug: "elegant-animated-housewarming-e-invitation",
    category: "digital-invites",
    collection: "House Warming",
    collectionSlug: "house-warming",
    priceFrom: 1799,
    tags: ["House Warming", "Animated", "Elegant", "Modern"],
    deliveryTime: "48h",
    styles: ["Elegant", "Modern", "Minimal"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection thumbnail
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",

    // ✅ Video preview
    video: {
      platform: "youtube",
      url: "https://youtu.be/VsVX7l8L-po?si=gpgPDdlDGpU9_5h3",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "A beautifully animated housewarming e-invitation crafted with soft pastel tones, graceful motion, and calming background music. Perfect for celebrating Griha Pravesh, Vastu Pooja, or your first gathering with warmth and elegance.",

    whatIncluded: [
      "Animated housewarming e-invitation",
      "Pastel theme design",
      "Smooth motion transitions",
      "Background music",
      "Custom event details",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Email sharing format",
      "YouTube & Reel compatible file",
    ],

    subOccasion: [
      "house-warming",
      "griha-pravesh",
      "vastu-pooja",
      "new-home",
    ],
  },
  {
    id: "prod-37",
    title: "Traditional Griha Pravesh Digital Video Invitation",
    slug: "traditional-griha-pravesh-digital-video-invitation",
    category: "digital-invites",
    collection: "House Warming",
    collectionSlug: "house-warming",
    priceFrom: 1599,
    tags: [
      "Griha Pravesh",
      "House Warming",
      "Traditional",
      "Elegant",
    ],
    deliveryTime: "48h",
    styles: ["Traditional", "Elegant"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection thumbnail
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",

    // ✅ Video preview
    video: {
      platform: "youtube",
      url: "https://youtu.be/3FD-AJ6-8_s?si=zJ2WUzyDncCVKTf3",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Celebrate your new beginning with a beautifully designed traditional Griha Pravesh digital video invitation. Crafted with elegant animations and cultural aesthetics, this invite brings warmth, devotion, and joy to your housewarming celebration.",

    whatIncluded: [
      "Traditional Griha Pravesh video invite",
      "Elegant animated scenes",
      "Cultural design elements",
      "Background devotional or soft music",
      "Customized event details",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "YouTube & Reel compatible format",
    ],

    subOccasion: [
      "griha-pravesh",
      "house-warming",
      "new-home",
    ],
  },
  {
    id: "prod-38",
    title: "1st Birthday Caricature Video Invitation",
    slug: "1st-birthday-caricature-video-invitation",
    category: "digital-invites",
    collection: "Birthday",
    collectionSlug: "birthday",
    priceFrom: 1999,
    tags: ["1st Birthday", "Caricature", "Kids", "Emotional"],
    deliveryTime: "72h",
    styles: ["Illustrated", "Playful", "Emotional"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection thumbnail
    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",

    // ✅ Video preview
    video: {
      platform: "youtube",
      url: "https://youtu.be/Z4dhpolw958?si=RI-7GE22LVBaEQeW",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "A heart-touching caricature video invitation specially crafted for a baby’s first birthday. Designed to highlight love between siblings and celebrate the birthday girl as the star of the moment — turning a beautiful milestone into a lifelong memory.",

    whatIncluded: [
      "Customized caricature characters",
      "1st birthday themed illustrations",
      "Emotional storytelling flow",
      "Background music",
      "Highlight focus on birthday child",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp share version",
      "Instagram Reel format",
    ],

    subOccasion: [
      "1st-birthday",
      "kids-birthday",
      "birthday-celebration",
    ],
  },
  {
    id: "prod-39",
    title: "25th Birthday Celebration Video Invitation",
    slug: "25th-birthday-celebration-video-invitation",
    category: "digital-invites",
    collection: "Birthday",
    collectionSlug: "birthday",
    priceFrom: 1799,
    tags: ["25th Birthday", "Birthday", "Celebration", "Trendy"],
    deliveryTime: "48h",
    styles: ["Modern", "Vibrant", "Fun"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection thumbnail
    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",

    // ✅ Video preview
    video: {
      platform: "youtube",
      url: "https://youtu.be/C3mJSu8kYzE?si=HfzD3yAoSTl15FIF",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Celebrate your milestone 25th birthday with a stylish and high-energy video invitation. Designed with modern animations, fun transitions, and vibrant visuals to make your big day unforgettable.",

    whatIncluded: [
      "Customized birthday video invite",
      "Trendy animations & transitions",
      "Party-style background music",
      "Event details customization",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
    ],

    subOccasion: [
      "25th-birthday",
      "milestone-birthday",
      "birthday-celebration",
    ],
  },
  {
    id: "prod-40",
    title: "Artistic 1st Birthday Caricature Video Invitation",
    slug: "artistic-1st-birthday-caricature-video-invitation",
    category: "digital-invites",
    collection: "Birthday",
    collectionSlug: "birthday",
    priceFrom: 1999,
    tags: ["1st Birthday", "Caricature", "Kids", "Artistic"],
    deliveryTime: "72h",
    styles: ["Illustrated", "Playful", "Animated"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection thumbnail
    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",

    // ✅ Video preview
    video: {
      platform: "youtube",
      url: "https://youtu.be/8QZ_6s0Tj94?si=_zfqRQygEyahpdu8",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Celebrate your little one’s first milestone with an artistic caricature video invitation. Designed like a colorful canvas, this invite blends creativity, laughter, and love to turn your baby’s 1st birthday into a joyful masterpiece.",

    whatIncluded: [
      "Custom baby caricature illustration",
      "Art-inspired birthday theme",
      "Colorful animated scenes",
      "Background music",
      "Personalized event details",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
    ],

    subOccasion: [
      "1st-birthday",
      "kids-birthday",
      "birthday-celebration",
    ],
  },
  {
    id: "prod-41",
    title: "Royal Theme 1st Birthday Video Invitation",
    slug: "royal-theme-1st-birthday-video-invitation",
    category: "digital-invites",
    collection: "Birthday",
    collectionSlug: "birthday",
    priceFrom: 2299,
    tags: ["1st Birthday", "Royal", "Kids", "Premium"],
    deliveryTime: "72h",
    styles: ["Royal", "Elegant", "Animated"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection thumbnail
    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",

    // ✅ Video preview
    video: {
      platform: "youtube",
      url: "https://youtu.be/g9lCx1OsdBE?si=9HCyR_6jYqSaA8Te",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Celebrate your little prince’s first birthday with a royal-themed digital video invitation. Designed with elegant animations, charming characters, and magical elements, this invite turns a precious milestone into a grand celebration.",

    whatIncluded: [
      "Royal-themed birthday animation",
      "Custom baby character design",
      "Premium visual elements",
      "Soft background music",
      "Personalized event details",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
    ],

    subOccasion: [
      "1st-birthday",
      "kids-birthday",
      "royal-theme",
    ],
  },
  {
    id: "prod-42",
    title: "Cute Baby Theme 1st Birthday Video Invitation",
    slug: "cute-baby-theme-1st-birthday-video-invitation",
    category: "digital-invites",
    collection: "Birthday",
    collectionSlug: "birthday",
    priceFrom: 1999,
    tags: ["1st Birthday", "Cute Theme", "Kids", "Fun"],
    deliveryTime: "72h",
    styles: ["Playful", "Vibrant", "Animated"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection thumbnail
    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",

    // ✅ Video preview
    video: {
      platform: "youtube",
      url: "https://youtu.be/-qn-fxmItnw?si=t2BymJD7mSCVcT8-",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Celebrate your little one’s first birthday with a cheerful baby-themed digital video invitation. Filled with cute characters, bright colors, playful animations, and happy music — this invite beautifully captures the joy and innocence of your baby’s big milestone.",

    whatIncluded: [
      "Cute baby character theme",
      "Bright colorful animations",
      "Fun & cheerful background music",
      "Personalized event details",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
      "YouTube sharing file",
    ],

    subOccasion: [
      "1st-birthday",
      "kids-birthday",
      "baby-theme",
    ],
  },
  {
    id: "prod-43",
    title: "Milestone Year Digital Video Invitation",
    slug: "milestone-year-digital-video-invitation",
    category: "digital-invites",
    collection: "Birthday",
    collectionSlug: "birthday",
    priceFrom: 1899,
    tags: ["Milestone", "Birthday", "Anniversary", "Celebration"],
    deliveryTime: "48h",
    styles: ["Elegant", "Modern", "Minimal"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection thumbnail
    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",

    // ✅ Video preview
    video: {
      platform: "youtube",
      url: "https://youtu.be/lvYfv91YRSc?si=NgNapQomeLXcDRhv",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "A beautifully crafted milestone year digital video invitation designed to celebrate life’s most meaningful moments. Perfect for birthdays, anniversaries, achievements, and special year milestones — with elegant visuals, personalized details, and celebratory charm.",

    whatIncluded: [
      "Customized milestone number design",
      "Personalized names & photos",
      "Elegant animated visuals",
      "Soft celebratory background music",
      "Event details customization",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
      "YouTube sharing file",
    ],

    subOccasion: [
      "milestone-celebration",
      "birthday",
      "anniversary",
      "achievement",
    ],
  },
  {
    id: "prod-44",
    title: "Premium 1st Birthday Digital Invitation (All Themes)",
    slug: "premium-1st-birthday-digital-invitation",
    category: "digital-invites",
    collection: "Birthday",
    collectionSlug: "birthday",
    priceFrom: 2199,
    tags: ["1st Birthday", "Kids", "Caricature", "Animated"],
    deliveryTime: "72h",
    styles: ["Playful", "Vibrant", "Royal", "Animated"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection thumbnail
    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",

    // ✅ Video preview
    video: {
      platform: "youtube",
      url: "https://youtu.be/LvowbWeCyh8?si=rKF1NazpnFKN_C-s",
    },

    previewImages: [],
    bestSeller: true,
    isNew: true,

    description:
      "Make your baby’s first birthday truly magical with a premium digital invitation designed to capture joy, cuteness, and celebration. From jungle and cartoon themes to royal and pastel styles, every invite is fully personalized to reflect your baby’s personality and your dream celebration.",

    whatIncluded: [
      "Animated 1st birthday video invitation",
      "Choice of jungle, royal, pastel or cartoon theme",
      "Custom baby caricature or illustration",
      "Name, photo & event detail personalization",
      "Background music",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Email sharing format",
      "Instagram Reel compatible file",
    ],

    subOccasion: [
      "1st-birthday",
      "kids-birthday",
      "baby-boy",
      "baby-girl",
    ],
  },
  {
    id: "prod-45",
    title: "1st Birthday Invitation Templates (Multi-Theme)",
    slug: "1st-birthday-invitation-templates-multi-theme",
    category: "digital-invites",
    collection: "Birthday",
    collectionSlug: "birthday",
    priceFrom: 1899,
    tags: ["1st Birthday", "Kids", "Templates", "Animated"],
    deliveryTime: "72h",
    styles: ["Playful", "Animated"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection thumbnail
    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",

    // ✅ Video preview
    video: {
      platform: "youtube",
      url: "https://youtu.be/PKcefEUpNxE?si=rd0DcIoQRV8WhBPc",
    },

    previewImages: [],
    bestSeller: true,
    isNew: true,

    description:
      "Celebrate your baby’s first year of cuddles, giggles, and milestones with adorable animated 1st birthday invitation templates. Fully personalized and designed with love, these invites beautifully capture your baby’s journey from first cry to first cake.",

    whatIncluded: [
      "Animated 1st birthday invitation template",
      "Choice of baby boy / baby girl theme",
      "Support for twin birthdays",
      "Theme options: Jungle, Unicorn, Teddy Bear & more",
      "Name, photo & event detail personalization",
      "Background music",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
      "Email sharing file",
    ],

    subOccasion: [
      "1st-birthday",
      "kids-birthday",
      "baby-boy",
      "baby-girl",
      "twin-birthday",
      "theme-party",
    ],
  },
  {
    id: "prod-46",
    title: "Customizable 1st Birthday Digital Invitation Template",
    slug: "customizable-1st-birthday-digital-invitation-template",
    category: "digital-invites",
    collection: "Birthday",
    collectionSlug: "birthday",
    priceFrom: 1799,
    tags: ["1st Birthday", "Kids", "Template", "Animated"],
    deliveryTime: "48h",
    styles: ["Playful", "Animated", "Modern"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection thumbnail
    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",

    // ✅ Video preview
    video: {
      platform: "youtube",
      url: "https://youtu.be/kWwXFZNdp1o?si=1yq2bmUqYkJOTdtm",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Make your baby’s first birthday truly memorable with a customizable digital invitation template. Designed for both baby boys and girls, this animated invite can be personalized with your baby’s name, event details, and theme — creating the perfect start to a joyful celebration.",

    whatIncluded: [
      "Animated 1st birthday invitation template",
      "Customization with baby name, date & time",
      "Theme selection (animal, royal & more)",
      "Unique illustrations & animations",
      "Background music",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
      "Email sharing file",
    ],

    subOccasion: [
      "1st-birthday",
      "kids-birthday",
      "milestone-birthday",
      "first-year-celebration",
    ],
  },
  {
    id: "prod-47",
    title: "Space-Themed 10th Birthday Invitation Video",
    slug: "space-themed-10th-birthday-invitation-video",
    category: "digital-invites",
    collection: "Birthday",
    collectionSlug: "birthday",
    priceFrom: 1899,
    tags: ["10th Birthday", "Space Theme", "Kids", "Animated"],
    deliveryTime: "48h",
    styles: ["Playful", "Animated", "Storytelling"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection thumbnail
    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",

    // ✅ Video preview
    video: {
      platform: "youtube",
      url: "https://youtu.be/1E4izLV0TnA?si=GQuKPcuBlHUJ0qkl",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Blast off into a galaxy of fun with this space-themed 10th birthday invitation video. Featuring planets, stars, and exciting animations, this invite is perfect for young space lovers who want to celebrate their milestone birthday in an out-of-this-world style.",

    whatIncluded: [
      "Space-themed animated birthday video",
      "Planets, stars & galactic visuals",
      "Customization with child’s name & event details",
      "Fun background music",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
      "Email sharing file",
    ],

    subOccasion: [
      "10th-birthday",
      "kids-birthday",
      "theme-party",
      "space-theme",
    ],
  },
  {
    id: "prod-48",
    title: "Cute 1st Birthday Invitation Video Template",
    slug: "cute-1st-birthday-invitation-video-template",
    category: "digital-invites",
    collection: "Birthday",
    collectionSlug: "birthday",
    priceFrom: 1699,
    tags: ["1st Birthday", "Kids", "Cute Theme", "Animated"],
    deliveryTime: "48h",
    styles: ["Cinematic", "Playful", "Animated"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection thumbnail
    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",

    // ✅ Video preview
    video: {
      platform: "youtube",
      url: "https://youtu.be/3Hb14jNvZ9k?si=fc3jXM2Q0Ob4_A9k",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Celebrate your baby’s first milestone with a cute and cheerful digital invitation video template. Designed with bright colors, joyful animations, and heartfelt moments, this invite is perfect for announcing your little one’s big day in the most adorable way.",

    whatIncluded: [
      "Cute animated 1st birthday video template",
      "Customization with baby name, date & venue",
      "Suitable for baby boy or baby girl",
      "Colorful illustrations & animations",
      "Background music",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
      "YouTube sharing file",
    ],

    subOccasion: [
      "1st-birthday",
      "kids-birthday",
      "baby-boy",
      "baby-girl",
    ],
  },
  {
    id: "prod-49",
    title: "Jungle & Carnival Theme AI Birthday Invitation Video",
    slug: "jungle-carnival-theme-ai-birthday-invitation-video",
    category: "ai-video-invites",
    collection: "Birthday-AI Invites",
    collectionSlug: "birthday-ai",
    priceFrom: 2999,
    tags: ["AI Birthday", "Jungle Theme", "Carnival", "Kids"],
    deliveryTime: "72h",
    styles: ["Vibrant", "Animated", "Playful"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection thumbnail
    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",

    // ✅ Video preview
    video: {
      platform: "youtube",
      url: "https://youtu.be/kmV7Ec0xtu0?si=lt1cLpBYYetXGxe6",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Experience birthdays like never before with a Jungle + Carnival themed AI-powered invitation video. Packed with vibrant visuals, animated characters, and personalized storytelling — this one-of-a-kind AI invite turns your child’s celebration into a magical visual journey.",

    whatIncluded: [
      "AI-generated birthday invitation video",
      "Jungle & carnival themed visuals",
      "Personalized child name & age highlights",
      "Animated scene transitions",
      "Background music",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
      "YouTube sharing file",
    ],

    subOccasion: [
      "kids-birthday",
      "ai-birthday",
      "jungle-theme",
      "carnival-theme",
    ],
  },
  {
    id: "prod-50",
    title: "Magical Story 1st Birthday Video Invitation",
    slug: "magical-story-1st-birthday-video-invitation",
    category: "digital-invites",
    collection: "Birthday",
    collectionSlug: "birthday",
    priceFrom: 2199,
    tags: ["1st Birthday", "Emotional", "Storytelling", "Kids"],
    deliveryTime: "72h",
    styles: ["Emotional", "Elegant", "Animated"],
    languages: ["Telugu", "Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/BVamSUAquYQ?si=Pu6rHn9zj1R-LH9Y",
    },

    previewImages: [],
    bestSeller: true,
    isNew: true,

    description:
      "A heart-touching 1st birthday video invitation that tells your baby’s story with warmth and emotion. Designed to capture love, giggles, and milestones — this invite turns your little one’s first birthday into a magical memory that lasts forever.",

    whatIncluded: [
      "Emotional storytelling birthday video",
      "Soft animations & transitions",
      "Personalized baby name & milestones",
      "Background music",
      "Customized event details",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
    ],

    subOccasion: [
      "1st-birthday",
      "kids-birthday",
      "emotional-theme",
      "story-invite",
    ],
  },
  {
    id: "prod-51",
    title: "Superhero Theme Birthday Invitation Video",
    slug: "superhero-theme-birthday-invitation-video",
    category: "digital-invites",
    collection: "Birthday",
    collectionSlug: "birthday",
    priceFrom: 1999,
    tags: ["Superhero", "Kids Birthday", "Theme Party", "Animated"],
    deliveryTime: "72h",
    styles: ["Vibrant", "Animated", "Fun"],
    languages: ["Telugu", "Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/7lNzJRbX6yU?si=zZbOJXwybRyszZs3",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Turn your child’s birthday into a super-powered celebration with a custom superhero-themed video invitation. Featuring comic-style visuals, action animations, and heroic energy — this invite makes your little one the star of their own hero story.",

    whatIncluded: [
      "Superhero themed animated birthday video",
      "Comic-style visuals & transitions",
      "Personalized hero name & age",
      "Action background music",
      "Event detail customization",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
    ],

    subOccasion: [
      "kids-birthday",
      "superhero-theme",
      "theme-party",
    ],
  },
  {
    id: "prod-52",
    title: "Baby Shower Caricature Video Invitation",
    slug: "baby-shower-caricature-video-invitation",
    category: "digital-invites",
    collection: "Baby Showers",
    collectionSlug: "baby-showers",
    priceFrom: 1999,
    tags: ["Baby Shower", "Caricature", "Cute", "Celebration"],
    deliveryTime: "72h",
    styles: ["Illustrated", "Playful", "Cute"],
    languages: ["Telugu", "Hindi", "English"],

    // ✅ Collection thumbnail
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",

    // ✅ Video preview
    video: {
      platform: "youtube",
      url: "https://youtu.be/pWVVqoRIj5Q?si=8oB6JI7yYIigZL2j",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Celebrate the joy of welcoming your little bundle of happiness with a charming baby shower caricature video invitation. Designed with adorable illustrations, playful animations, and heartwarming elements — this invite beautifully captures the sweetness of anticipation.",

    whatIncluded: [
      "Customized caricature characters",
      "Cute baby shower themed illustrations",
      "Animated scenes & transitions",
      "Background music",
      "Personalized event details",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
      "YouTube sharing file",
    ],

    subOccasion: [
      "baby-shower",
      "mom-to-be",
      "celebration",
    ],
  },
  {
    id: "prod-53",
    title: "Traditional Baby Shower Digital Invitation",
    slug: "traditional-baby-shower-digital-invitation",
    category: "digital-invites",
    collection: "Baby Showers",
    collectionSlug: "baby-showers",
    priceFrom: 1799,
    tags: ["Baby Shower", "Traditional", "Godh Bharai", "Srimantam"],
    deliveryTime: "48h",
    styles: ["Traditional", "Elegant"],
    languages: ["Telugu", "Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/-75V__gu9QQ?si=Tv6vFxCyyIvhB2SQ",
    },

    previewImages: [],
    bestSeller: true,
    isNew: true,

    description:
      "Celebrate the joy of motherhood with a beautifully crafted traditional baby shower digital invitation. Designed to reflect cultural warmth and family love, this invite blends rituals, elegance, and modern animation for ceremonies like Godh Bharai, Srimantam, and Seemantham.",

    whatIncluded: [
      "Traditional baby shower invitation video",
      "Cultural motifs & festive designs",
      "Soft pastel or traditional color themes",
      "Animated storytelling elements",
      "Custom names, timings & venue details",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram & YouTube share format",
    ],

    subOccasion: [
      "baby-shower",
      "godh-bharai",
      "srimantam",
      "seemantham",
    ],
  },
  {
    id: "prod-54",
    title: "Jalwa Ceremony Caricature Digital Invitation",
    slug: "jalwa-ceremony-caricature-digital-invitation",
    category: "digital-invites",
    collection: "Baby Showers",
    collectionSlug: "baby-showers",
    priceFrom: 1999,
    tags: ["Jalwa Ceremony", "Caricature", "Celebration", "Pre-Baby Event"],
    deliveryTime: "72h",
    styles: ["Illustrated", "Playful", "Creative"],
    languages: ["Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/kVr6CVm8NIQ?si=IboG-TQ5ZLy2MaHh",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Celebrate the vibrant Jalwa ceremony with a fun and artistic caricature digital invitation. Designed with lively illustrations and personalized characters, this invite captures the excitement, colors, and joy of the celebration in a memorable way.",

    whatIncluded: [
      "Customized caricature characters",
      "Jalwa ceremony themed illustrations",
      "Animated scenes & transitions",
      "Background music",
      "Personalized event details",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp share version",
      "Instagram Reel format",
    ],

    subOccasion: [
      "baby-shower",
      "jalwa-ceremony",
      "pre-baby-celebration",
    ],
  },
  {
    id: "prod-55",
    title: "Cute Pastel Baby Shower Digital Invitation",
    slug: "cute-pastel-baby-shower-digital-invitation",
    category: "digital-invites",
    collection: "Baby Showers",
    collectionSlug: "baby-showers",
    priceFrom: 1699,
    tags: ["Baby Shower", "Cute", "Pastel Theme", "Mom To Be"],
    deliveryTime: "48h",
    styles: ["Cute", "Elegant"],
    languages: ["Telugu", "Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/OJH6IV8LLps?si=G97R99RkH0lDbzKi",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Celebrate the mom-to-be with a cute and pastel-themed baby shower digital invitation. Designed with sweet animations, soft colors, and joyful elements, this invite beautifully brings friends and family together to shower love and blessings on the baby and parents.",

    whatIncluded: [
      "Pastel themed baby shower video invite",
      "Cute baby illustrations & animations",
      "Customized name & event details",
      "Soft joyful background music",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
      "YouTube sharing file",
    ],

    subOccasion: [
      "baby-shower",
      "mom-to-be",
      "pastel-theme",
    ],
  },
  {
    id: "prod-56",
    title: "Elegant Family Baby Shower Digital Invitation",
    slug: "elegant-family-baby-shower-digital-invitation",
    category: "digital-invites",
    collection: "Baby Showers",
    collectionSlug: "baby-showers",
    priceFrom: 1799,
    tags: ["Baby Shower", "Family", "Elegant", "Traditional Touch"],
    deliveryTime: "48h",
    styles: ["Elegant", "Traditional"],
    languages: ["Telugu", "Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/GrssoTeDvTI?si=PQrUj8xusggUuHD7",
    },

    previewImages: [],
    bestSeller: true,
    isNew: true,

    description:
      "A beautifully designed baby shower digital invitation created to celebrate the joy of welcoming a precious new life. Featuring elegant visuals, adorable baby elements, and personalized family details — this invite reflects warmth, tradition, and heartfelt celebration.",

    whatIncluded: [
      "Elegant baby shower invitation video",
      "Personalized family name & event details",
      "Soft colors with cute baby illustrations",
      "Smooth animations",
      "Background music",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp share version",
      "Instagram Reel format",
      "YouTube sharing file",
    ],

    subOccasion: [
      "baby-shower",
      "family-celebration",
      "traditional-theme",
    ],
  },
  {
    id: "prod-57",
    title: "Chudda Ceremony Digital Invitation (Baby Girl)",
    slug: "chudda-ceremony-digital-invitation-baby-girl",
    category: "digital-invites",
    collection: "Baby Showers",
    collectionSlug: "baby-showers",
    priceFrom: 1799,
    tags: ["Chudda Ceremony", "Baby Girl", "Traditional", "Celebration"],
    deliveryTime: "48h",
    styles: ["Cute", "Traditional", "Elegant"],
    languages: ["Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/fqwawhOHyLM?si=Eyr89GM3nkKMNA6_",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Celebrate your little princess’s Chudda Ceremony with a beautifully crafted digital invitation. Designed with adorable visuals, soft colors, and personalized details, this invite captures the joy, blessings, and warmth of welcoming your baby girl into the family.",

    whatIncluded: [
      "Chudda ceremony themed invitation video",
      "Cute baby girl elements",
      "Customized baby name & family details",
      "Soft animations & transitions",
      "Background music",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
    ],

    subOccasion: [
      "chudda-ceremony",
      "baby-girl",
      "baby-welcome",
    ],
  },
  {
    id: "prod-58",
    title: "Traditional Jalwa Ceremony Caricature Invitation",
    slug: "traditional-jalwa-ceremony-caricature-invitation",
    category: "digital-invites",
    collection: "Baby Showers",
    collectionSlug: "baby-showers",
    priceFrom: 2199,
    tags: ["Jalwa Ceremony", "Traditional", "Caricature", "Baby Welcome"],
    deliveryTime: "72h",
    styles: ["Traditional", "Illustrated", "Elegant"],
    languages: ["Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/lYbnefwmgvk?si=00_PRPprQb2Skw3I",
    },

    previewImages: [],
    bestSeller: true,
    isNew: true,

    description:
      "A divine and heartwarming Jalwa ceremony digital invitation designed to celebrate your newborn’s arrival with tradition, gratitude, and joy. Featuring personalized baby caricatures, spiritual elements, and serene animations, this invite beautifully reflects Indian family values and blessings.",

    whatIncluded: [
      "Custom baby caricature design",
      "Traditional elements (cradle, diya, kalash, florals)",
      "Temple bells & soothing background music",
      "Personalized baby & family details",
      "Elegant animated storytelling",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp share version",
      "Instagram Reel format",
      "YouTube sharing file",
    ],

    subOccasion: [
      "jalwa-ceremony",
      "namkaran",
      "baby-welcome",
      "barso",
    ],
  },
  {
    id: "prod-59",
    title: "Baby Welcome Jalwa Digital Invitation",
    slug: "baby-welcome-jalwa-digital-invitation",
    category: "digital-invites",
    collection: "Baby Showers",
    collectionSlug: "baby-showers",
    priceFrom: 1899,
    tags: ["Baby Welcome", "Jalwa Ceremony", "Traditional", "Celebration"],
    deliveryTime: "48h",
    styles: ["Traditional", "Cute"],
    languages: ["Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/8WY069G9HAo?si=gMUVYXV-bmlku28h",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Welcome your precious newborn with a joyful and beautifully animated Jalwa ceremony invitation. Designed with soft pastel tones, traditional Indian motifs, and personalized caricatures — this invite turns your baby’s welcome into a warm and unforgettable digital memory.",

    whatIncluded: [
      "Pastel themed baby welcome invitation",
      "Traditional Jalwa elements (cradle, flowers, dhol)",
      "Customized baby name & family caricatures",
      "Smooth animations & transitions",
      "Background music",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
    ],

    subOccasion: [
      "baby-welcome",
      "jalwa-ceremony",
      "namkaran",
    ],
  },
  {
    id: "prod-60",
    title: "Complete Wedding Stationery Design Package",
    slug: "complete-wedding-stationery-design-package",
    category: "digital-invites",
    collection: "Stationery",
    collectionSlug: "stationery",
    priceFrom: 3499,
    tags: ["Wedding Stationery", "Premium", "Customized", "Design Suite"],
    deliveryTime: "72h",
    styles: ["Elegant", "Traditional", "Modern"],
    languages: ["Telugu", "Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/CPwAeW95uPQ?si=XJhT-aPxoQetKBDa",
    },

    previewImages: [],
    bestSeller: true,
    isNew: true,

    description:
      "Wedding stationery is more than information — it’s a reflection of your love story. Our complete wedding stationery design package brings elegance, creativity, and personalization together, creating a cohesive visual experience across every element of your wedding celebration.",

    whatIncluded: [
      "Save the date design",
      "Wedding invitation card",
      "Welcome board",
      "Itinerary & schedule cards",
      "Menu cards",
      "Thank you notes",
      "Theme-matching custom designs",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "High-resolution printable files",
      "Digital sharing formats",
      "PDF & image formats",
    ],

    subOccasion: [
      "wedding-stationery",
      "welcome-board",
      "wedding-decor",
    ],
  },
  {
    id: "prod-61",
    title: "Custom Wedding Welcome Board Design",
    slug: "custom-wedding-welcome-board-design",
    category: "digital-invites",
    collection: "Stationery",
    collectionSlug: "stationery",
    priceFrom: 1499,
    tags: ["Welcome Board", "Wedding Decor", "Signage", "Custom Design"],
    deliveryTime: "48h",
    styles: ["Elegant", "Floral", "Traditional"],
    languages: ["Telugu", "Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/zeAeDiTm7HE?si=16A5IUghL5U-oY21",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Create a beautiful first impression on your wedding day with a custom-designed welcome board. Crafted to match your wedding theme and decor, our welcome signage adds elegance and charm to every celebration — from Mehendi and Haldi to Wedding and Reception.",

    whatIncluded: [
      "Custom welcome board design",
      "Theme-based styling (floral, traditional, modern)",
      "Couple names & event personalization",
      "High-resolution artwork",
      "Printable & digital formats",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "Print-ready high-resolution file",
      "Digital sharing version",
      "PDF & image formats",
    ],

    subOccasion: [
      "welcome-board",
      "mehendi",
      "haldi",
      "wedding",
      "reception",
    ],
  },
  /* =====================================================
     PRE-WEDDING CEREMONIES
  ===================================================== */

  {
    id: "prod-62",
    title: "Mehndi Ceremony Digital Invitation",
    slug: "mehndi-ceremony-digital-invitation",
    category: "digital-invites",
    collection: "Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 1699,
    tags: ["Mehndi", "Pre Wedding", "Traditional", "Celebration"],
    deliveryTime: "48h",
    styles: ["Traditional", "Vibrant", "Floral"],
    languages: ["Telugu", "Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/0KfLb4HAkbY?si=cCdGdFxM4PmDAeoQ",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Celebrate the soul of every Indian wedding with a vibrant Mehndi ceremony digital invitation. Designed with traditional green hues, floral elements, playful animations, and elegant caricatures — this invite perfectly captures the joy, culture, and festive spirit of your special day.",

    whatIncluded: [
      "Mehndi ceremony animated invite",
      "Traditional green & yellow color palette",
      "Floral motifs & desi design elements",
      "Custom caricatures & names",
      "Background music sync",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
      "Email sharing file",
    ],

    subOccasion: [
      "Engagement",
      "wedding-invite"
    ],
  },

  {
    id: "prod-63",
    title: "Engagement Digital Invitation (Cinematic Style)",
    slug: "engagement-digital-invitation-cinematic-style",
    category: "digital-invites",
    collection: "Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 1999,
    tags: ["Engagement", "Ring Ceremony", "Save The Date", "Love Story"],
    deliveryTime: "72h",
    styles: ["Elegant", "Floral", "Cinematic"],
    languages: ["Telugu", "Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/az3hSDxKHQM?si=D1dgHgAve5M6ZYqO",
    },

    previewImages: [],
    bestSeller: true,
    isNew: true,

    description:
      "Your engagement deserves more than a simple card. This cinematic digital invitation transforms your special moment into a beautifully animated love story featuring elegant visuals, cultural elements, and personalized design that reflects your bond.",

    whatIncluded: [
      "Engagement / Ring ceremony invitation video",
      "Custom caricature love story",
      "Floral, watercolor or traditional themes",
      "Animated transitions & music",
      "Personalized couple details",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
      "YouTube sharing file",
    ],

    subOccasion: [
      "Engagement",
      "wedding-invite"
    ],
  },

  {
    id: "prod-64",
    title: "Ring Ceremony Digital Invitation",
    slug: "ring-ceremony-digital-invitation",
    category: "digital-invites",
    collection: "Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 1799,
    tags: ["Ring Ceremony", "Engagement", "Elegant", "Couple Invite"],
    deliveryTime: "48h",
    styles: ["Romantic", "Elegant", "Modern"],
    languages: ["Telugu", "Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/lSxN4F7oUDs?si=SEOq7X_VaMdLrplY",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "Celebrate the beginning of forever with a beautifully designed ring ceremony digital invitation. Featuring romantic animations, elegant themes, and personalized details — this invite announces your special moment with charm and grace.",

    whatIncluded: [
      "Ring ceremony animated invite",
      "Couple names, date & venue customization",
      "Romantic background music",
      "Modern, floral or royal themes",
      "Smooth animations",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp share version",
      "Instagram Reel format",
      "YouTube sharing file",
    ],

    subOccasion: [
      "Engagement",
      "wedding-invite"
    ],
  },
  /* =====================================================
     SAVE THE DATE – VIDEO INVITATIONS
  ===================================================== */

  {
    id: "prod-65",
    title: "Save The Date Cinematic Video Invitation",
    slug: "save-the-date-cinematic-video-invitation",
    category: "digital-invites",
    collection: "Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 1999,
    tags: ["Save The Date", "Cinematic", "Couple", "Video Invite"],
    deliveryTime: "72h",
    styles: ["Elegant", "Cinematic", "Modern"],
    languages: ["Telugu", "Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/b9bm5p1bkJc?si=BrIk2sZ_30GmY7wY",
    },

    previewImages: [],
    bestSeller: true,
    isNew: true,

    description:
      "Announce your special day with a cinematic save-the-date video invitation designed to leave a lasting impression. Featuring personalized caricatures, elegant visuals, and detailed storytelling — this invite sets the tone for your upcoming celebration.",

    whatIncluded: [
      "Save the date video invitation",
      "Custom caricature & outfit detailing",
      "Cinematic transitions",
      "Personalized couple names",
      "Background music",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
      "YouTube sharing file",
    ],

    subOccasion: ["save-the-date"],
  },

  {
    id: "prod-66",
    title: "Colorful Mehndi Style Save The Date Invite",
    slug: "colorful-mehndi-style-save-the-date-invite",
    category: "digital-invites",
    collection: "Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 1899,
    tags: ["Save The Date", "Caricature", "Colorful", "Traditional"],
    deliveryTime: "72h",
    styles: ["Vibrant", "Traditional"],
    languages: ["Telugu", "Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/bwdXSwM_EKo?si=Ymbx-NC-szaHB_k5",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "A vibrant mehndi-inspired save-the-date caricature invitation designed with rich colors, joyful animations, and traditional charm. Perfect for couples who want to announce their wedding date with fun, culture, and creativity.",

    whatIncluded: [
      "Mehndi-style save the date video",
      "Colorful caricature illustrations",
      "Traditional design elements",
      "Animated transitions",
      "Customized couple names & date",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp sharing format",
      "Instagram Reel format",
    ],

    subOccasion: ["save-the-date"],
  },

  {
    id: "prod-67",
    title: "Animated Caricature Save The Date Invitation",
    slug: "animated-caricature-save-the-date-invitation",
    category: "digital-invites",
    collection: "Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 2199,
    tags: ["Save The Date", "Caricature", "Animated", "Couple Story"],
    deliveryTime: "72h",
    styles: ["Illustrated", "Emotional", "Storytelling"],
    languages: ["Telugu", "Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/paRkgHq41_M?si=tkQwNFWf9oI8BSqt",
    },

    previewImages: [],
    bestSeller: true,
    isNew: true,

    description:
      "A heartwarming animated caricature save-the-date invitation that captures your love story with emotion and creativity. Designed to showcase your journey and announce your big date in a truly memorable way.",

    whatIncluded: [
      "Animated caricature couple design",
      "Story-based invitation flow",
      "Emotional transitions",
      "Personalized names & wedding date",
      "Background music",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp optimized version",
      "Instagram Reel format",
      "YouTube sharing file",
    ],

    subOccasion: ["save-the-date"],
  },

  {
    id: "prod-68",
    title: "Caricature Reception Style Save The Date Video",
    slug: "caricature-reception-style-save-the-date-video",
    category: "digital-invites",
    collection: "Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 1999,
    tags: ["Save The Date", "Reception Style", "Caricature", "Celebration"],
    deliveryTime: "72h",
    styles: ["Fun", "Animated", "Celebration"],
    languages: ["Telugu", "Hindi", "English"],

    thumbnail: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/jeSPBG8Id6s?si=2OE46DNdz7_5aOQW",
    },

    previewImages: [],
    bestSeller: false,
    isNew: true,

    description:
      "A lively caricature-style save-the-date video inspired by reception celebrations. Filled with joyful animations, expressive characters, and festive energy — this invite announces your wedding date with style and excitement.",

    whatIncluded: [
      "Reception-style caricature invitation",
      "Festive animated scenes",
      "Customized couple characters",
      "Music & transitions",
      "Personalized event details",
      "1 revision round",
    ],

    revisionPolicy:
      "1 revision round included. Additional revisions available at ₹500 each.",

    deliverables: [
      "MP4 video (Full HD)",
      "WhatsApp share version",
      "Instagram Reel format",
    ],

    subOccasion: ["save-the-date"],
  },

  /* =====================================================
     SAVE THE DATE – DIGITAL VIDEO INVITATIONS
  ===================================================== */
  {
    id: "prod-69",
    title: "Fun Caricature Save The Date Invitation",
    slug: "fun-caricature-save-the-date-invitation",
    category: "digital-invites",
    collection: "Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 1799,
    tags: ["Save The Date", "Caricature", "Fun", "Animated"],
    deliveryTime: "48h",
    styles: ["Playful", "Romantic", "Traditional"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
    video: { platform: "youtube", url: "https://youtu.be/JHZE44_xIy8?si=JMPek8u-kB3hcS0k" },
    previewImages: [],
    bestSeller: false,
    isNew: true,
    description:
      "A lively and fun-filled caricature save-the-date invitation designed to announce your big day with joy and creativity. Perfect for couples who want a cheerful and memorable first announcement.",
    whatIncluded: [
      "Custom caricature couple design",
      "Animated scenes",
      "Personalized names & date",
      "Music sync",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["MP4 video", "WhatsApp share version", "Instagram Reel"],
    subOccasion: ["save-the-date"],
  },

  {
    id: "prod-70",
    title: "Elegant Save The Date Invitation Video",
    slug: "elegant-save-the-date-invitation-video",
    category: "digital-invites",
    collection: "Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 1899,
    tags: ["Save The Date", "Elegant", "Couple", "Wedding"],
    deliveryTime: "48h",
    styles: ["Elegant", "Minimal", "Romantic"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
    video: { platform: "youtube", url: "https://youtu.be/yUDBuvE4e30?si=QzjFVJRlT9VtTNkH" },
    previewImages: [],
    bestSeller: true,
    isNew: true,
    description:
      "A graceful save-the-date digital invitation crafted with elegance, charm, and personalization — perfect for announcing your wedding date with style.",
    whatIncluded: [
      "Elegant animated layout",
      "Couple names & wedding date",
      "Theme & music customization",
      "Smooth transitions",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["MP4 video", "WhatsApp format", "Instagram Reel"],
    subOccasion: ["save-the-date"],
  },

  {
    id: "prod-71",
    title: "Romantic Save The Date Digital Invitation",
    slug: "romantic-save-the-date-digital-invitation",
    category: "digital-invites",
    collection: "Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 1899,
    tags: ["Save The Date", "Romantic", "Wedding Journey"],
    deliveryTime: "48h",
    styles: ["Romantic", "Modern"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
    video: { platform: "youtube", url: "https://youtu.be/Yl1UDiBf3Ss?si=z8ShSJiiA8OkZZSU" },
    previewImages: [],
    bestSeller: false,
    isNew: true,
    description:
      "A romantic save-the-date invitation designed with smooth animations, soft visuals, and heartfelt emotion — the perfect beginning to your forever.",
    whatIncluded: [
      "Romantic animated design",
      "Personalized couple names",
      "Wedding date highlight",
      "Music & transitions",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["MP4 video", "WhatsApp share", "Instagram Reel"],
    subOccasion: ["save-the-date"],
  },

  {
    id: "prod-72",
    title: "Destination Wedding Save The Date Invite",
    slug: "destination-wedding-save-the-date-invite",
    category: "digital-invites",
    collection: "Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 2499,
    tags: ["Save The Date", "Destination Wedding", "Travel Theme"],
    deliveryTime: "72h",
    styles: ["Royal", "Travel", "Cinematic"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80",
    video: { platform: "youtube", url: "https://youtu.be/BlhpW3LFbRU?si=9JemVKRmhhRHzK1z" },
    previewImages: [],
    bestSeller: true,
    isNew: true,
    description:
      "A destination wedding save-the-date invitation blending Indian tradition with travel vibes — perfect for announcing your big fat destination wedding.",
    whatIncluded: [
      "Destination-themed visuals",
      "Travel-style layout",
      "Couple names & destination",
      "Music fusion",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["MP4 video", "WhatsApp version", "Instagram Reel"],
    subOccasion: ["save-the-date"],
  },

  {
    id: "prod-73",
    title: "Traditional Indian Save The Date Invitation",
    slug: "traditional-indian-save-the-date-invitation",
    category: "digital-invites",
    collection: "Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 1899,
    tags: ["Save The Date", "Traditional", "Indian Wedding"],
    deliveryTime: "48h",
    styles: ["Traditional", "Storytelling"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
    video: { platform: "youtube", url: "https://youtu.be/mbrW8xMzGj4?si=-asdnztqVF5QPaSd" },
    previewImages: [],
    bestSeller: false,
    isNew: true,
    description:
      "A festive Indian-style save-the-date invitation enriched with cultural motifs, colors, and celebration — perfect for traditional weddings.",
    whatIncluded: [
      "Traditional Indian elements",
      "Animated motifs",
      "Couple names & date",
      "Background music",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["MP4 video", "WhatsApp format", "Instagram Reel"],
    subOccasion: ["save-the-date"],
  },

  {
    id: "prod-74",
    title: "Final Countdown Save The Date Video",
    slug: "final-countdown-save-the-date-video",
    category: "digital-invites",
    collection: "Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 999,
    tags: ["Save The Date", "Countdown", "Reminder"],
    deliveryTime: "24h",
    styles: ["Minimal", "Modern"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80",
    video: { platform: "youtube", url: "https://youtu.be/QgtTKx-fJHM?si=0g7-IVNTNGa4RTI4" },
    previewImages: [],
    bestSeller: true,
    isNew: true,
    description:
      "A high-impact countdown save-the-date video designed for final reminders — perfect for Instagram reels, WhatsApp updates, and wedding hype.",
    whatIncluded: [
      "Countdown animation",
      "Event date highlight",
      "Vertical reel format",
      "Fast delivery",
    ],
    revisionPolicy: "No revisions included.",
    deliverables: ["MP4 Reel format"],
    subOccasion: ["save-the-date"],
  },
  {
    id: "prod-75",
    title: "AI Cinematic Save The Date Invitation",
    slug: "ai-cinematic-save-the-date-invitation",
    category: "ai-video-invites",
    collection: "AI Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 2999,
    tags: ["AI Save The Date", "Cinematic", "Luxury", "Trending"],
    deliveryTime: "48h",
    styles: ["Cinematic", "Luxury", "Modern"],
    languages: ["Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/4FMbFFqJe4s?si=Up755Wae1rB6m30T",
    },

    previewImages: [],
    bestSeller: true,
    isNew: true,

    description:
      "A breathtaking AI-powered Save The Date invitation where emotion meets animation. Designed like a cinematic short film, this invite transforms your love story into a magical visual experience.",

    whatIncluded: [
      "AI-generated cinematic scenes",
      "Luxury motion transitions",
      "Personalized couple names & date",
      "Story-based flow",
      "Background cinematic music",
      "1 revision",
    ],

    revisionPolicy: "1 revision included.",
    deliverables: ["MP4 video", "WhatsApp version", "Instagram Reel"],

    subOccasion: ["save-the-date"],
  },

  {
    id: "prod-76",
    title: "AI Story-Based Save The Date Wedding Video",
    slug: "ai-story-based-save-the-date-wedding-video",
    category: "ai-video-invites",
    collection: "AI Wedding Invites",
    collectionSlug: "wedding-invites",
    priceFrom: 2799,
    tags: ["AI Save The Date", "Love Story", "Emotional", "Wedding"],
    deliveryTime: "48h",
    styles: ["Emotional", "Cinematic", "Modern"],
    languages: ["Hindi", "English"],
    thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",

    video: {
      platform: "youtube",
      url: "https://youtu.be/LD_nadh4WxA?si=QCQUEyxfmDgGDk45",
    },

    previewImages: [],
    bestSeller: true,
    isNew: true,

    description:
      "A beautifully crafted AI Save The Date invitation that narrates your wedding announcement as a cinematic love story — emotional, elegant, and unforgettable.",

    whatIncluded: [
      "AI story-based animation",
      "Couple journey narrative",
      "Cinematic visuals",
      "Names, date & event details",
      "Music & transitions",
      "1 revision",
    ],

    revisionPolicy: "1 revision included.",
    deliverables: ["MP4 video", "WhatsApp share", "Instagram Reel"],

    subOccasion: ["save-the-date"],
  },
  {
    id: "prod-77",
    title: "Animated Caricature Wedding Invitation Video",
    slug: "animated-caricature-wedding-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 5999,
    tags: [
      "Wedding",
      "Caricature",
      "Animated Invite",
      "Customized",
      "Bride Groom Cartoon",
      "Wedding Video Invite"
    ],
    deliveryTime: "72h",
    styles: ["Animated", "Storytelling", "Fun", "Playful", "Modern"],
    languages: ["Hindi", "English", "Telugu", "Urdu", "Punjabi"],
    thumbnail: "https://img.youtube.com/vi/yLqBu4jlQKk/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/yLqBu4jlQKk/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "Turn your love story into a delightful animated caricature wedding invitation! This customized animated video features cute cartoon versions of the bride and groom, narrating their journey in a fun and engaging way. A perfect blend of creativity, storytelling, and personalization that leaves your guests smiling even before the wedding begins.",
    whatIncluded: [
      "Customized bride & groom caricatures",
      "Animated storytelling wedding video",
      "Background music & sound effects",
      "Personalized names, dates & venue details",
      "Theme customization as per couple’s style",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for caricature design, text, and animation flow.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/yLqBu4jlQKk?si=a1KAqpnGr9l7XHU0",
    },
    religion: ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: ["wedding-invite", "Caricature Invite", "Animated Wedding"]
  },
  {
    id: "prod-78",
    title: "Caricature Wedding Journey Invitation Video",
    slug: "caricature-wedding-journey-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 6499,
    tags: [
      "Wedding",
      "Caricature Invite",
      "Haldi Invite",
      "Sangeet Invite",
      "Barat Invite",
      "Wedding Functions",
      "Animated Wedding",
      "Full Wedding Journey"
    ],
    deliveryTime: "72h",
    styles: ["Animated", "Storytelling", "Fun", "Playful", "Traditional"],
    languages: ["Hindi", "English", "Telugu", "Urdu", "Punjabi"],
    thumbnail: "https://img.youtube.com/vi/Nm2yXRUdzOg/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/Nm2yXRUdzOg/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "Celebrate every beautiful wedding ritual in one delightful caricature invitation video! From the joyful Haldi ceremony and Grah Shanti rituals to the vibrant Sangeet night, grand Barat, and the emotional wedding ceremony — this animated invite captures the entire wedding journey in a fun, engaging, and personalized way. A perfect invitation that tells the complete story of your big celebration.",
    whatIncluded: [
      "Customized bride & groom caricatures",
      "Animated scenes for Haldi, Grah Shanti, Sangeet, Barat & Wedding",
      "Personalized names, dates & venue details for each function",
      "Background music & sound effects",
      "Theme customization as per wedding vibe",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for caricature design, text, and animation sequence.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/Nm2yXRUdzOg?si=BE9kTODc3XCFmtwZ",
    },
    religion: ["Hindu", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: [
      "wedding-invite",
      "Haldi",
      "Grah Shanti",
      "Sangeet",
      "Barat",
      "Caricature Invite"
    ]
  },
  {
    id: "prod-79",
    title: "Wedding Wardrobe Planner Caricature Invitation Video",
    slug: "wedding-wardrobe-planner-caricature-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 6999,
    tags: [
      "Wedding",
      "Wardrobe Planner",
      "Caricature Invite",
      "Wedding Functions",
      "Haldi Theme",
      "Sangeet Theme",
      "Wedding Dress Code",
      "Animated Wedding Invite"
    ],
    deliveryTime: "72h",
    styles: ["Animated", "Storytelling", "Fun", "Playful", "Modern", "Illustrated"],
    languages: ["Hindi", "English", "Telugu", "Urdu", "Punjabi"],
    thumbnail: "https://img.youtube.com/vi/EpPMH8b6_zs/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/EpPMH8b6_zs/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "Help your guests dress perfectly for every wedding function with this unique wardrobe planner caricature invitation video! From Haldi colors to Sangeet glam and the wedding day elegance, this animated invite guides guests on what to wear for each event — making your celebration stylish, organized, and unforgettable.",
    whatIncluded: [
      "Customized bride & groom caricatures",
      "Wardrobe planner for each wedding function",
      "Animated storytelling wedding invite",
      "Personalized names, dates & venue details",
      "Theme-based dress code suggestions",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for caricature design, wardrobe planner details, and animation flow.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/EpPMH8b6_zs?si=MhNN-b89oOloRY5o",
    },
    religion: ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: [
      "wedding-invite",
      "Haldi",
      "Sangeet",
      "wardrobe-planner",
      "Caricature Invite"
    ]
  },
  {
    id: "prod-80",
    title: "Caricature Snapshot Wedding Invitation Video",
    slug: "caricature-snapshot-wedding-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 5499,
    tags: [
      "Wedding",
      "Caricature Invite",
      "Snapshot Invite",
      "Photo Frame Invite",
      "Digital Illustration",
      "Cute Wedding Invite",
      "Animated Wedding"
    ],
    deliveryTime: "72h",
    styles: ["Animated", "Illustrated", "Fun", "Playful", "Modern"],
    languages: ["Hindi", "English", "Telugu", "Urdu", "Punjabi"],
    thumbnail: "https://img.youtube.com/vi/-woLXEGms6M/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/-woLXEGms6M/maxresdefault.jpg"
    ],
    bestSeller: false,
    isNew: true,
    description:
      "Capture your love story in adorable snapshot frames with this caricature wedding invitation video. Designed like a series of vibrant photo moments, this digital illustration invite highlights the couple’s journey in quick, charming scenes that are fun, memorable, and completely personalized.",
    whatIncluded: [
      "Customized bride & groom caricatures",
      "Snapshot-style animated frames",
      "Personalized names, dates & venue details",
      "Creative digital illustration theme",
      "Background music & animation effects",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for caricature design, frame content, and animation sequence.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/-woLXEGms6M?si=v2EgnVrgEWg3iOQS",
    },
    religion: ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: [
      "wedding-invite",
      "Caricature Invite",
      "Snapshot Invite",
      "Illustrated Invite"
    ]
  },
  {
    id: "prod-81",
    title: "Mobile Caricature Wedding Invitation Video",
    slug: "mobile-caricature-wedding-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 5799,
    tags: [
      "Wedding",
      "Mobile Invite",
      "Caricature Invite",
      "Love Story Invite",
      "WhatsApp Wedding Invite",
      "Animated Wedding",
      "Personalized Invite"
    ],
    deliveryTime: "72h",
    styles: ["Animated", "Storytelling", "Fun", "Playful", "Modern"],
    languages: ["Hindi", "English", "Telugu", "Urdu", "Punjabi"],
    thumbnail: "https://img.youtube.com/vi/Q-XyO0OUKM0/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/Q-XyO0OUKM0/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: false,
    description:
      "Designed for the mobile era, this caricature wedding invitation video beautifully unfolds your love story in a format perfect for phone screens and WhatsApp sharing. Fun, vibrant, and fully personalized, this animated invite ensures your guests experience your journey instantly and memorably.",
    whatIncluded: [
      "Customized bride & groom caricatures",
      "Mobile-optimized animated storytelling",
      "Personalized names, dates & venue details",
      "Background music & smooth animations",
      "Theme customization based on couple’s story",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for caricature design, text, and animation flow.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-optimized format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/Q-XyO0OUKM0?si=YkWZyoQvnzdtxwSC",
    },
    religion: ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: [
      "wedding-invite",
      "Caricature Invite",
      "Mobile Invite",
      "Love Story Invite"
    ]
  },
  {
    id: "prod-82",
    title: "Whimsical Caricature Wedding Invitation Video",
    slug: "whimsical-caricature-wedding-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 5299,
    tags: [
      "Wedding",
      "Caricature Invite",
      "Whimsical Invite",
      "Cute Wedding Invite",
      "Digital Illustration",
      "Animated Wedding",
      "Fun Invite"
    ],
    deliveryTime: "72h",
    styles: ["Animated", "Illustrated", "Fun", "Playful", "Modern"],
    languages: ["Hindi", "English", "Telugu", "Urdu", "Punjabi"],
    thumbnail: "https://img.youtube.com/vi/Z9cjH1_5a0Y/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/Z9cjH1_5a0Y/maxresdefault.jpg"
    ],
    bestSeller: false,
    isNew: false,
    description:
      "Add a touch of laughter and charm to your wedding announcement with this whimsical caricature invitation video. Featuring cute artistic renditions of the bride and groom, this digital invite spreads joy, love, and personality in a fun and memorable way.",
    whatIncluded: [
      "Customized bride & groom caricatures",
      "Whimsical animated scenes",
      "Personalized names, dates & venue details",
      "Creative digital illustration theme",
      "Background music & smooth animations",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for caricature design, text, and animation flow.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/Z9cjH1_5a0Y?si=w2rh6I0H5F8XCUpX",
    },
    religion: ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: [
      "wedding-invite",
      "Caricature Invite",
      "Whimsical Invite"
    ]
  },
  {
    id: "prod-83",
    title: "Bengali Caricature Wedding Invitation Story Video",
    slug: "bengali-caricature-wedding-invitation-story-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 6299,
    tags: [
      "Wedding",
      "Bengali Wedding",
      "Caricature Invite",
      "Wedding Story",
      "Traditional Wedding",
      "Animated Wedding",
      "Regional Wedding Invite"
    ],
    deliveryTime: "72h",
    styles: ["Animated", "Storytelling", "Traditional", "Illustrated", "Emotional"],
    languages: ["Hindi", "English"],
    thumbnail: "https://img.youtube.com/vi/ILNriY1BRsw/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/ILNriY1BRsw/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "Celebrate the charm and traditions of a Bengali wedding with this beautifully illustrated caricature invitation video. From shy glances to the sacred rituals, this animated invite captures the couple’s journey with cultural richness, emotion, and personalized storytelling.",
    whatIncluded: [
      "Customized bride & groom caricatures in Bengali attire",
      "Animated storytelling inspired by Bengali wedding rituals",
      "Personalized names, dates & venue details",
      "Traditional theme elements and background music",
      "Creative digital illustration style",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for caricature design, cultural elements, and animation flow.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/ILNriY1BRsw?si=A8XEyeGV6jBrRaQp",
    },
    religion: ["Hindu"],
    region: ["East Indian"],
    subOccasion: [
      "wedding-invite",
      "Bengali Wedding",
      "Caricature Invite",
      "Wedding Story"
    ]
  },
  {
    id: "prod-84",
    title: "Sikh Caricature Wedding Invitation Celebration Video",
    slug: "sikh-caricature-wedding-invitation-celebration-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 6299,
    tags: [
      "Wedding",
      "Sikh Wedding",
      "Punjabi Wedding",
      "Caricature Invite",
      "Jaggo Invite",
      "Anand Karaj",
      "Traditional Wedding",
      "Animated Wedding"
    ],
    deliveryTime: "72h",
    styles: ["Animated", "Storytelling", "Traditional", "Fun", "Illustrated"],
    languages: ["Punjabi", "Hindi", "English"],
    thumbnail: "https://img.youtube.com/vi/t7VIU9rY0cw/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/t7VIU9rY0cw/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "Experience the joy and vibrance of a Sikh wedding celebration with this personalized caricature invitation video. From the energetic Jaggo night to the sacred Anand Karaj ceremony, this animated invite beautifully showcases Punjabi traditions with fun, color, and heartfelt storytelling.",
    whatIncluded: [
      "Customized bride & groom caricatures in Sikh/Punjabi attire",
      "Animated scenes for Jaggo and Anand Karaj rituals",
      "Personalized names, dates & venue details",
      "Traditional Punjabi theme elements and background music",
      "Creative digital illustration style",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for caricature design, cultural elements, and animation flow.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/t7VIU9rY0cw?si=-51sFqADuWAiwenV",
    },
    religion: ["Sikh"],
    region: ["North Indian"],
    subOccasion: [
      "wedding-invite",
      "Sikh Wedding",
      "Jaggo",
      "Anand Karaj",
      "Caricature Invite"
    ]
  },
  {
    id: "prod-85",
    title: "Mehendi Ceremony Caricature Invitation Video",
    slug: "mehendi-ceremony-caricature-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 3999,
    tags: [
      "Wedding",
      "Mehendi Invite",
      "Caricature Invite",
      "Wedding Function",
      "Mehendi Ceremony",
      "Animated Invite",
      "Digital Wedding Invite"
    ],
    deliveryTime: "72h",
    styles: ["Animated", "Fun", "Playful", "Traditional", "Illustrated"],
    languages: ["Hindi", "English", "Telugu", "Urdu", "Punjabi"],
    thumbnail: "https://img.youtube.com/vi/jyHsxNFBupM/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/jyHsxNFBupM/maxresdefault.jpg"
    ],
    bestSeller: false,
    isNew: true,
    description:
      "Celebrate the vibrant colors and joyful spirit of the Mehendi ceremony with this delightful caricature invitation video. Designed to capture the beauty, fun, and traditions of the event, this animated invite sets the perfect tone for your Mehendi celebration.",
    whatIncluded: [
      "Customized bride & groom caricatures",
      "Mehendi-themed animated scenes",
      "Personalized names, dates & venue details",
      "Traditional design elements & background music",
      "Creative digital illustration style",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for caricature design, text, and animation flow.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/jyHsxNFBupM?si=ym_FHcdHTXBKgLBE",
    },
    religion: ["Hindu", "Muslim", "Sikh", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: [
      "wedding-invite",
      "Mehendi",
      "Caricature Invite"
    ]
  },
  // {
  //   id: "prod-86",
  //   title: "Royal Rajasthani Caricature Wedding Invitation Video",
  //   slug: "royal-rajasthani-caricature-wedding-invitation-video",
  //   category: "digital-invites",
  //   collection: "Wedding",
  //   collectionSlug: "wedding-invites",
  //   priceFrom: 7499,
  //   tags: [
  //     "Wedding",
  //     "Royal Wedding",
  //     "Rajasthani Wedding",
  //     "Caricature Invite",
  //     "Family Introduction",
  //     "Traditional Wedding",
  //     "Luxury Wedding Invite",
  //     "Animated Wedding"
  //   ],
  //   deliveryTime: "72h",
  //   styles: ["Animated", "Royal", "Traditional", "Storytelling", "Luxury", "Illustrated"],
  //   languages: ["Hindi", "English"],
  //   thumbnail: "https://img.youtube.com/vi/8SOjpEQlIhI/maxresdefault.jpg",
  //   previewImages: [
  //     "https://img.youtube.com/vi/8SOjpEQlIhI/maxresdefault.jpg"
  //   ],
  //   bestSeller: true,
  //   isNew: true,
  //   description:
  //     "Step into regal elegance with this Royal Rajasthani caricature wedding invitation video. Featuring majestic visuals, traditional attire, and a graceful family introduction, this animated invite beautifully blends heritage, luxury, and personalization for a truly royal wedding announcement.",
  //   whatIncluded: [
  //     "Customized bride, groom & family caricatures in Rajasthani attire",
  //     "Royal-themed animated storytelling",
  //     "Family introduction scenes",
  //     "Personalized names, dates & venue details",
  //     "Traditional music & royal design elements",
  //     "3 revision rounds"
  //   ],
  //   revisionPolicy:
  //     "3 revision rounds included for caricature design, family details, and animation flow.",
  //   deliverables: [
  //     "HD MP4 Video (1080p)",
  //     "Mobile-friendly format for WhatsApp sharing"
  //   ],
  //   video: {
  //     platform: "youtube",
  //     url: "https://youtu.be/8SOjpEQlIhI?si=B1b4a84Xad8qPWvC",
  //   },
  //   religion: ["Hindu"],
  //   region: ["West Indian"],
  //   subOccasion: [
  //     "wedding-invite",
  //     "Rajasthani Wedding",
  //     "Royal Wedding",
  //     "Family Introduction",
  //     "Caricature Invite"
  //   ]
  // },
  {
    id: "prod-87",
    title: "Romantic Love Journey Wedding Invitation Video",
    slug: "romantic-love-journey-wedding-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 5899,
    tags: [
      "Wedding",
      "Love Story Invite",
      "Wedding Journey",
      "Romantic Invite",
      "Timeline Invite",
      "Emotional Wedding",
      "Digital Wedding Invite"
    ],
    deliveryTime: "72h",
    styles: ["Emotional", "Storytelling", "Elegant", "Modern"],
    languages: ["Hindi", "English", "Telugu", "Urdu", "Punjabi"],
    thumbnail: "https://img.youtube.com/vi/34Fch93LnvU/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/34Fch93LnvU/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "Celebrate your journey from the first meeting to forever with this romantic love timeline wedding invitation video. Designed with elegant animations, emotional storytelling, and a beautiful soundtrack, this personalized digital invite captures every milestone of your relationship in a heartwarming way.",
    whatIncluded: [
      "Couple’s journey timeline animation",
      "Customized theme & design style",
      "Romantic background soundtrack",
      "Personalized names, dates & venue details",
      "Blend of traditional & modern elements",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for content flow, text, and animation style.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/34Fch93LnvU?si=XI3E0iEy3WNZ0HyQ",
    },
    religion: ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: [
      "wedding-invite",
      "Love Story",
      "Wedding Journey",
      "Romantic Invite"
    ]
  },
  {
    id: "prod-88",
    title: "Elegant Personalized Wedding Invitation Video",
    slug: "elegant-personalized-wedding-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 5599,
    tags: [
      "Wedding",
      "Elegant Invite",
      "Personalized Wedding",
      "Modern Traditional Invite",
      "Classy Wedding Invite",
      "Digital Wedding Invite"
    ],
    deliveryTime: "72h",
    styles: ["Elegant", "Modern", "Emotional", "Storytelling"],
    languages: ["Hindi", "English", "Telugu", "Urdu", "Punjabi"],
    thumbnail: "https://img.youtube.com/vi/xUjEJ-e47zg/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/xUjEJ-e47zg/maxresdefault.jpg"
    ],
    bestSeller: false,
    isNew: true,
    description:
      "A graceful blend of tradition and modern design, this elegant wedding invitation video beautifully presents the couple’s journey with smooth animations, classy transitions, and a personalized theme. Perfect for couples who want a refined and heartfelt digital invite.",
    whatIncluded: [
      "Fully personalized wedding theme",
      "Smooth animations & classy transitions",
      "Background music matching the couple’s vibe",
      "Personalized names, dates & venue details",
      "Modern yet traditional design style",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for theme, text, and animation flow.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/xUjEJ-e47zg?si=ibQUuz4e7gApH_-b",
    },
    religion: ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: [
      "wedding-invite",
      "Elegant Invite",
      "Personalized Wedding"
    ]
  },
  {
    id: "prod-89",
    title: "2 States Cultural Fusion Wedding Invitation Video",
    slug: "2-states-cultural-fusion-wedding-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 6999,
    tags: [
      "Wedding",
      "2 States Wedding",
      "Cultural Fusion",
      "North South Wedding",
      "Intercultural Wedding",
      "Custom Wedding Invite",
      "Animated Wedding Invite"
    ],
    deliveryTime: "72h",
    styles: ["Storytelling", "Emotional", "Traditional", "Modern", "Illustrated"],
    languages: ["Hindi", "English", "Telugu", "Punjabi", "Urdu"],
    thumbnail: "https://img.youtube.com/vi/0z9Wb10L-E0/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/0z9Wb10L-E0/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "Celebrate the union of two cultures with this beautifully crafted 2 States wedding invitation video. Designed to reflect traditions from both families, this animated invite blends cultural elements, storytelling, and personalized details into one heartwarming digital experience.",
    whatIncluded: [
      "Cultural elements from both families",
      "Custom couple story animation",
      "Fusion or dual-theme background music",
      "Personalized names, dates, venues & dress codes",
      "Traditional and modern design blend",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for cultural elements, text, and animation flow.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/0z9Wb10L-E0?si=k-Cu691yCvC3JFg4",
    },
    religion: ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian"],
    subOccasion: [
      "wedding-invite",
      "2 States Wedding",
      "Cultural Fusion",
      "Intercultural Wedding"
    ]
  },
  {
    id: "prod-90",
    title: "Event-wise Wedding Story Invitation Video",
    slug: "event-wise-wedding-story-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 6299,
    tags: [
      "Wedding",
      "Wedding Functions Invite",
      "Haldi Mehendi Sangeet Invite",
      "Wedding Story",
      "Animated Wedding Invite",
      "Digital Wedding Invite"
    ],
    deliveryTime: "72h",
    styles: ["Storytelling", "Emotional", "Traditional", "Animated", "Elegant"],
    languages: ["Hindi", "English", "Telugu", "Urdu", "Punjabi"],
    thumbnail: "https://img.youtube.com/vi/YVkXXWQo-F4/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/YVkXXWQo-F4/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "Tell your complete wedding story with this beautifully designed event-wise invitation video. Covering Haldi, Mehendi, Sangeet, Wedding, and Reception, this animated invite blends emotions, traditions, and joyful moments into one seamless digital experience.",
    whatIncluded: [
      "Customized couple theme & animations",
      "Event-wise breakdown for all wedding functions",
      "Soulful background music (filmy or traditional)",
      "Personalized names, dates & venue details",
      "Elegant storytelling design style",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for event details, text, and animation flow.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/YVkXXWQo-F4?si=vUsUvY3lRz3Buy3P",
    },
    religion: ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: [
      "wedding-invite",
      "Haldi",
      "Mehendi",
      "Sangeet",
      "Reception",
      "Wedding Story"
    ]
  },
  {
    id: "prod-91",
    title: "Traditional Royal Rajasthani Wedding Invitation Video",
    slug: "traditional-royal-rajasthani-wedding-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 7299,
    tags: [
      "Wedding",
      "Rajasthani Wedding",
      "Royal Wedding",
      "Traditional Invite",
      "Folk Theme Wedding",
      "Cultural Wedding Invite",
      "Animated Wedding"
    ],
    deliveryTime: "72h",
    styles: ["Royal", "Traditional", "Animated", "Storytelling", "Vibrant"],
    languages: ["Hindi", "English"],
    thumbnail: "https://img.youtube.com/vi/UNKNOWN/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/UNKNOWN/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "Immerse your guests in the grandeur of a true Rajwada celebration with this traditional Royal Rajasthani wedding invitation video. Featuring majestic forts, elephants, vibrant turbans, bandhani patterns, and soulful folk music, this animated invite captures the rich colors and culture of Rajasthan in a personalized storytelling format.",
    whatIncluded: [
      "Rajasthani cultural elements like forts, elephants, kalash & bandhani",
      "Folk-inspired background music & dhol beats",
      "Animated storytelling with personalized couple names, dates & venue",
      "Vibrant traditional theme and design",
      "Mobile-friendly sharing format",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for theme, cultural elements, and text details.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/pClU2AH-ib4?si=TxXfBOsT-8h95cOI",
    },
    religion: ["Hindu"],
    region: ["West Indian"],
    subOccasion: [
      "wedding-invite",
      "Rajasthani Wedding",
      "Royal Wedding",
      "Traditional Invite"
    ]
  },
  {
    id: "prod-92",
    title: "Caricature with Traditional Wedding Invitation Video",
    slug: "caricature-traditional-wedding-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 5799,
    tags: [
      "Wedding",
      "Caricature Invite",
      "Traditional Wedding",
      "Animated Wedding Invite",
      "Personalized Wedding",
      "Digital Wedding Invite"
    ],
    deliveryTime: "72h",
    styles: ["Animated", "Traditional", "Storytelling", "Illustrated", "Elegant"],
    languages: ["Hindi", "English", "Telugu", "Urdu", "Punjabi"],
    thumbnail: "https://img.youtube.com/vi/QS4VcByHlw4/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/QS4VcByHlw4/maxresdefault.jpg"
    ],
    bestSeller: false,
    isNew: true,
    description:
      "A beautiful blend of traditional wedding charm and modern caricature artistry, this digital invitation video captures the couple’s journey with vibrant visuals, heartfelt storytelling, and elegant animation. Perfect for couples who want culture and creativity together in one invite.",
    whatIncluded: [
      "Personalized bride & groom caricatures",
      "Traditional themed animated storytelling",
      "High-quality animation with engaging background music",
      "Personalized names, dates & venue details",
      "Creative design suitable for all wedding styles",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for caricature design, theme, and text details.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/QS4VcByHlw4?si=50ua5TAUtLufBCi_",
    },
    religion: ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: [
      "wedding-invite",
      "Caricature Invite",
      "Traditional Invite"
    ]
  },
  {
    id: "prod-93",
    title: "3D Cinematic Wedding Invitation Video",
    slug: "3d-cinematic-wedding-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 7999,
    tags: [
      "Wedding",
      "3D Wedding Invite",
      "Cinematic Invite",
      "Elegant Wedding",
      "Realistic Animation",
      "Premium Wedding Invite",
      "Digital Wedding Invite"
    ],
    deliveryTime: "72h",
    styles: ["Cinematic", "Elegant", "Modern", "Luxury", "Storytelling"],
    languages: ["Hindi", "English", "Telugu", "Urdu", "Punjabi"],
    thumbnail: "https://img.youtube.com/vi/yQyXQynMifA/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/yQyXQynMifA/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "Step into a new dimension of wedding invitations with this stunning 3D cinematic wedding invite. Featuring realistic 3D elements, custom-designed venues, elegant decor, and smooth transitions, this immersive digital invite brings the couple’s story to life in a premium and unforgettable way.",
    whatIncluded: [
      "Realistic 3D wedding environment & animations",
      "Custom-designed venue, decor & transitions",
      "Cinematic background music",
      "Personalized names, dates & venue details",
      "Elegant storytelling with premium visuals",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for text, theme, and animation adjustments.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/yQyXQynMifA?si=dfPXUDKGS2LFfSC3",
    },
    religion: ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: [
      "wedding-invite",
      "3D Wedding Invite",
      "Cinematic Invite",
      "Premium Invite"
    ]
  },
  {
    id: "prod-94",
    title: "Sundowner Caricature Wedding Invitation Video",
    slug: "sundowner-caricature-wedding-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 6199,
    tags: [
      "Wedding",
      "Sundowner Invite",
      "Punjabi Wedding",
      "Caricature Invite",
      "Sunset Wedding",
      "Wedding Function Invite",
      "Animated Wedding"
    ],
    deliveryTime: "72h",
    styles: ["Animated", "Vibrant", "Fun", "Storytelling", "Modern"],
    languages: ["Punjabi", "Hindi", "English"],
    thumbnail: "https://img.youtube.com/vi/T-_WQ_drX2c/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/T-_WQ_drX2c/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "Celebrate your love under golden skies with this vibrant Sundowner caricature wedding invitation video. Blending Punjabi energy, sunset romance, and lively animations, this digital invite perfectly captures the fun, music, and unforgettable vibes of a sundowner wedding celebration.",
    whatIncluded: [
      "Customized bride & groom caricatures",
      "Sundowner sunset-themed animated scenes",
      "Punjabi-style music vibes & visuals",
      "Personalized names, dates & venue details",
      "Vibrant storytelling design style",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for caricature design, theme, and text details.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/T-_WQ_drX2c?si=9h1K31cj2s1oHm5n",
    },
    religion: ["Hindu", "Sikh", "Other"],
    region: ["North Indian", "Other"],
    subOccasion: [
      "wedding-invite",
      "Sundowner",
      "Punjabi Wedding",
      "Caricature Invite"
    ]
  },
  {
    id: "prod-95",
    title: "Sikh Caricature Wedding Stationery Invitation Video",
    slug: "sikh-caricature-wedding-stationery-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 6099,
    tags: [
      "Wedding",
      "Sikh Wedding",
      "Wedding Stationery",
      "Caricature Invite",
      "Punjabi Wedding",
      "Traditional Invite",
      "Animated Wedding"
    ],
    deliveryTime: "72h",
    styles: ["Animated", "Traditional", "Illustrated", "Storytelling"],
    languages: ["Punjabi", "Hindi", "English"],
    thumbnail: "https://img.youtube.com/vi/E9w4Ezco5m8/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/E9w4Ezco5m8/maxresdefault.jpg"
    ],
    bestSeller: false,
    isNew: true,
    description:
      "Inspired by meaningful Sikh symbols and traditional Punjabi elements, this caricature wedding invitation video reflects true wedding stationery aesthetics in a digital animated form. Perfect for couples who want their invite to showcase culture, heritage, and artistic personalization.",
    whatIncluded: [
      "Customized bride & groom caricatures in Sikh attire",
      "Wedding stationery-inspired animated design",
      "Traditional Sikh symbols & Punjabi cultural elements",
      "Personalized names, dates & venue details",
      "Elegant storytelling animation",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for caricature design, cultural elements, and text details.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/E9w4Ezco5m8?si=XzoyP9INEKNvTxAG",
    },
    religion: ["Sikh"],
    region: ["North Indian"],
    subOccasion: [
      "wedding-invite",
      "Sikh Wedding",
      "Wedding Stationery",
      "Caricature Invite"
    ]
  },
  {
    id: "prod-96",
    title: "Custom Indian Wedding Multi-Function Digital Invitation Video",
    slug: "custom-indian-wedding-multifunction-digital-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 6599,
    tags: [
      "Wedding",
      "Indian Wedding Invite",
      "Multi Function Invite",
      "Save The Date",
      "Haldi Mehendi Invite",
      "Engagement Invite",
      "Reception Invite",
      "Caricature Invite",
      "Traditional Invite"
    ],
    deliveryTime: "72h",
    styles: ["Animated", "Traditional", "Vibrant", "Storytelling", "Illustrated"],
    languages: ["Hindi", "English", "Punjabi", "Telugu", "Urdu"],
    thumbnail: "https://img.youtube.com/vi/RhbBq0_Q_1c/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/RhbBq0_Q_1c/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "A beautifully crafted custom Indian wedding digital invite that covers every celebration from Save the Date and Engagement to Haldi, Mehendi, Wedding, and Reception. Designed with cultural motifs, animated elements, and caricature artistry, this invite becomes the perfect beginning to your wedding festivities.",
    whatIncluded: [
      "Customized couple caricatures and animated elements",
      "Cultural motifs like phulkari patterns, kalash & traditional designs",
      "Event-wise sections for all wedding functions",
      "Personalized names, dates & venue details",
      "Vibrant storytelling design with background music",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for theme, event details, and animation flow.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/RhbBq0_Q_1c?si=xcQn1IT4ZUOMJfgy",
    },
    religion: ["Hindu", "Sikh", "Muslim", "Christian", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: [
      "wedding-invite",
      "save-the-date",
      "Engagement",
      "Haldi",
      "Mehendi",
      "Reception",
      "Caricature Invite"
    ]
  },
  {
    id: "prod-97",
    title: "Cinematic Caricature Wedding Invitation Video",
    slug: "cinematic-caricature-wedding-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 6699,
    tags: [
      "Wedding",
      "Caricature Invite",
      "Cinematic Invite",
      "Modern Traditional Invite",
      "Wedding Story Invite",
      "Animated Wedding",
      "Premium Digital Invite"
    ],
    deliveryTime: "72h",
    styles: ["Animated", "Storytelling", "Emotional", "Elegant", "Illustrated"],
    languages: ["Hindi", "English", "Punjabi", "Telugu", "Urdu"],
    thumbnail: "https://img.youtube.com/vi/9r8s82hcwFA/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/9r8s82hcwFA/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "Bring your love story to life with this cinematic caricature wedding invitation video that beautifully blends modern animation with traditional charm. Designed like a short film, this digital invite uses custom caricature art, elegant motifs, smooth transitions, and heartfelt storytelling to create a memorable wedding announcement.",
    whatIncluded: [
      "Custom bride & groom caricature storytelling",
      "Cinematic animation with smooth transitions",
      "Blend of modern and traditional design elements",
      "Event sections for Save the Date, Engagement, Haldi, Mehendi, Wedding & Reception",
      "Background music and visual storytelling effects",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for theme, text, and animation flow.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/9r8s82hcwFA?si=jvsFkL85bLDdTDcW",
    },
    religion: ["Hindu", "Sikh", "Muslim", "Christian", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: [
      "wedding-invite",
      "save-the-date",
      "Engagement",
      "Haldi",
      "Mehendi",
      "reception-invite",
      "Caricature Invite"
    ]
  },
  {
    id: "prod-98",
    title: "Chat to Shaadi Love Story Wedding Invitation Video",
    slug: "chat-to-shaadi-love-story-wedding-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 6499,
    tags: [
      "Wedding",
      "Love Story Invite",
      "Chat To Shaadi",
      "Haldi Invite",
      "Sangeet Invite",
      "Wedding Card Video",
      "Story Based Invite",
      "Animated Wedding"
    ],
    deliveryTime: "72h",
    styles: ["Storytelling", "Emotional", "Modern", "Animated", "Fun"],
    languages: ["Hindi", "English", "Telugu", "Urdu", "Punjabi"],
    thumbnail: "https://img.youtube.com/vi/DdfYvphGJq8/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/DdfYvphGJq8/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "From the first chat message to the promise of forever, this story-based wedding invitation video beautifully captures the couple’s journey. Combining love story storytelling with Haldi, Sangeet, and Wedding details, this all-in-one digital invite is personal, cinematic, and perfect for modern sharing platforms.",
    whatIncluded: [
      "Couple’s love story animation (Chat to Shaadi concept)",
      "Haldi, Sangeet & Wedding ceremony sections",
      "Personalized names, dates & venue details",
      "Cinematic storytelling with smooth transitions",
      "Background music matching the couple’s vibe",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for story flow, text, and animation style.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/DdfYvphGJq8?si=9x8xbqIdzMYoUWdV",
    },
    religion: ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: [
      "wedding-invite",
      "Love Story",
      "Haldi",
      "Sangeet",
      "Chat To Shaadi"
    ]
  },
  {
    id: "prod-99",
    title: "Caricature Wedding Invitation Template Video",
    slug: "caricature-wedding-invitation-template-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 5999,
    tags: [
      "Wedding",
      "Caricature Invite",
      "Wedding Template",
      "Save The Date",
      "Haldi Sangeet Invite",
      "All In One Invite",
      "Animated Wedding"
    ],
    deliveryTime: "72h",
    styles: ["Animated", "Storytelling", "Illustrated", "Modern", "Traditional"],
    languages: ["Hindi", "English", "Telugu", "Urdu", "Punjabi"],
    thumbnail: "https://img.youtube.com/vi/S_2xoJRmUFc/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/S_2xoJRmUFc/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "A beautifully designed caricature-style wedding invitation template that combines tradition with modern storytelling. Covering Save the Date, Haldi, Sangeet, and Wedding details in one seamless animated video, this digital invite is perfect for quick personalization while keeping the design elegant and memorable.",
    whatIncluded: [
      "Personalized bride & groom caricatures",
      "Template-based animated storytelling",
      "Sections for Save the Date, Haldi, Sangeet & Wedding",
      "Soulful background music & smooth transitions",
      "Personalized names, dates & venue details",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for text, caricature design, and animation flow.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/S_2xoJRmUFc?si=2iak3j5OyTkjo8Bo",
    },
    religion: ["Hindu", "Sikh", "Muslim", "Christian", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: [
      "wedding-invite",
      "save-the-date",
      "Haldi",
      "Sangeet",
      "Caricature Invite"
    ]
  },
  {
    id: "prod-100",
    title: "All-in-One Multi-Event Indian Wedding Invitation Video",
    slug: "all-in-one-multi-event-indian-wedding-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 6799,
    tags: [
      "Wedding",
      "Multi Event Invite",
      "Mehndi Invite",
      "Sehra Bandi",
      "Baraat Invite",
      "Reception Invite",
      "Indian Wedding Invite",
      "Animated Wedding"
    ],
    deliveryTime: "72h",
    styles: ["Storytelling", "Traditional", "Animated", "Vibrant", "Elegant"],
    languages: ["Hindi", "English", "Punjabi", "Urdu"],
    thumbnail: "https://img.youtube.com/vi/08TMa6IQgoI/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/08TMa6IQgoI/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "Announce your entire wedding celebration in one beautifully crafted digital invite. This all-in-one Indian wedding invitation video covers Mehndi, Sehra Bandi, Baraat, the sacred wedding ceremony, and the after party — seamlessly woven into a personalized storytelling experience.",
    whatIncluded: [
      "Event sections for Mehndi, Sehra Bandi, Baraat, Wedding & Reception",
      "Personalized names, dates, venue & timings for each function",
      "Choice of traditional or modern design style",
      "Background music, colors & smooth transitions",
      "Elegant animated storytelling format",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for event details, theme, and animation flow.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/08TMa6IQgoI?si=-ebqqCNcpaZSO9oi",
    },
    religion: ["Hindu", "Sikh", "Other"],
    region: ["North Indian"],
    subOccasion: [
      "wedding-invite",
      "Mehndi",
      "Sehra Bandi",
      "Baraat",
      "reception-invite"
    ]
  },
  {
    id: "prod-101",
    title: "Bride-Side Story Wedding Invitation Video",
    slug: "bride-side-story-wedding-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 6399,
    tags: [
      "Wedding",
      "Bride Side Invite",
      "Emotional Wedding Invite",
      "Storytelling Invite",
      "Haldi Sangeet Wedding",
      "Cinematic Wedding Invite"
    ],
    deliveryTime: "72h",
    styles: ["Emotional", "Storytelling", "Elegant", "Animated", "Poetic"],
    languages: ["Hindi", "English", "Telugu", "Urdu", "Punjabi"],
    thumbnail: "https://img.youtube.com/vi/VUaUX0wQcok/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/VUaUX0wQcok/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "A heartfelt wedding invitation told from the bride’s perspective, this cinematic digital invite beautifully narrates her story of love, family, and celebration. Perfect for Haldi, Sangeet, and Wedding day announcements, this storytelling invite turns emotions into unforgettable visuals.",
    whatIncluded: [
      "Bride-side storytelling theme and animations",
      "Event sections for Haldi, Sangeet & Wedding",
      "Personalized names, dates & venue details",
      "Poetic narration style with cinematic visuals",
      "Soulful background music",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for story flow, text, and animation style.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/VUaUX0wQcok?si=V2kVWq6_iGr-o1CH",
    },
    religion: ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: [
      "wedding-invite",
      "Bride Side",
      "Haldi",
      "Sangeet",
      "Story Invite"
    ]
  },
  {
    id: "prod-102",
    title: "Shiv Parvati Theme Hindu Wedding Invitation Video",
    slug: "shiv-parvati-theme-hindu-wedding-invitation-video",
    category: "digital-invites",
    collection: "Wedding",
    collectionSlug: "wedding-invites",
    priceFrom: 6899,
    tags: [
      "Wedding",
      "Hindu Wedding",
      "Shiv Parvati Theme",
      "Religious Wedding Invite",
      "Traditional Invite",
      "Devotional Invite",
      "Indian Wedding E-Card"
    ],
    deliveryTime: "72h",
    styles: ["Traditional", "Elegant", "Poetic", "Storytelling", "Illustrated"],
    languages: ["Hindi", "English", "Telugu"],
    thumbnail: "https://img.youtube.com/vi/sqWz2VwieP8/maxresdefault.jpg",
    previewImages: [
      "https://img.youtube.com/vi/sqWz2VwieP8/maxresdefault.jpg"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "Inspired by the divine love story of Lord Shiv and Goddess Parvati, this Hindu wedding invitation video blends devotion, tradition, and elegance into a magical digital invite. Designed to reflect sacred love and timeless blessings, this theme creates a deeply meaningful wedding announcement.",
    whatIncluded: [
      "Shiv–Parvati inspired devotional theme",
      "Traditional Hindu design elements and animations",
      "Personalized names, dates & venue details",
      "Elegant storytelling with sacred visual motifs",
      "Soulful background music",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for theme, text, and animation adjustments.",
    deliverables: [
      "HD MP4 Video (1080p)",
      "Mobile-friendly format for WhatsApp sharing"
    ],
    video: {
      platform: "youtube",
      url: "https://youtu.be/sqWz2VwieP8?si=mM-_E9n0rTRNNSIl",
    },
    religion: ["Hindu"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian"],
    subOccasion: [
      "wedding-invite",
      "Hindu Wedding",
      "traditional-wedding",
      "Shiv Parvati Invite"
    ]
  },

  {
    id: "prod-105",
    title: "Traditional Couple Caricature – Style 01",
    slug: "traditional-couple-caricature-style-01",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1499,
    tags: ["Caricature", "Traditional", "Couple"],
    deliveryTime: "48h",
    styles: ["Traditional"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/caricature/01.png",
    previewImages: [],
    bestSeller: true,
    isNew: true,
    description:
      "Traditional couple caricature illustration perfect for wedding invites, save the date, and digital sharing.",
    whatIncluded: [
      "High-quality couple caricature",
      "Outfit customization",
      "Color theme adjustment",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
  },

  {
    id: "prod-106",
    title: "Royal Ethnic Caricature – Style 02",
    slug: "royal-ethnic-caricature-style-02",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1499,
    tags: ["Caricature", "Royal", "Ethnic"],
    deliveryTime: "48h",
    styles: ["Royal", "Traditional"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/caricature/02.png",
    previewImages: [],
    bestSeller: false,
    isNew: true,
    description:
      "Royal-style ethnic caricature featuring elegant Indian outfits for couples.",
    whatIncluded: [
      "Royal couple caricature",
      "Dress color customization",
      "Background styling",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
  },

  {
    id: "prod-107",
    title: "Modern Casual Caricature – Style 03",
    slug: "modern-casual-caricature-style-03",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1299,
    tags: ["Caricature", "Modern", "Casual"],
    deliveryTime: "48h",
    styles: ["Modern"],
    languages: ["English", "Hindi"],
    thumbnail: "/caricature/03.png",
    previewImages: [],
    bestSeller: false,
    isNew: true,
    description:
      "Modern casual caricature ideal for engagement, save the date, and fun couple announcements.",
    whatIncluded: [
      "Modern outfit caricature",
      "Pose customization",
      "Color theme",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
  },

  {
    id: "prod-108",
    title: "Engagement Couple Caricature",
    slug: "engagement-couple-caricature",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1599,
    tags: ["Caricature", "Engagement"],
    deliveryTime: "48h",
    styles: ["Elegant"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/caricature/engagement.png",
    previewImages: [],
    bestSeller: true,
    isNew: false,
    description:
      "Elegant engagement caricature designed specially for ring ceremony and engagement announcements.",
    whatIncluded: [
      "Engagement pose caricature",
      "Outfit customization",
      "Background design",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
    subOccasion: ["engagement"],
  },

  {
    id: "prod-109",
    title: "Haldi Ceremony Caricature",
    slug: "haldi-ceremony-caricature",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1599,
    tags: ["Caricature", "Haldi", "Wedding"],
    deliveryTime: "48h",
    styles: ["Traditional", "Fun"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/caricature/haldi.png",
    previewImages: [],
    bestSeller: true,
    isNew: false,
    description:
      "Fun haldi ceremony caricature with bright colors and joyful expressions.",
    whatIncluded: [
      "Haldi theme caricature",
      "Yellow theme styling",
      "Traditional expressions",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
  },

  {
    id: "prod-110",
    title: "Reception Caricature Illustration",
    slug: "reception-caricature-illustration",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1699,
    tags: ["Caricature", "Reception", "Royal"],
    deliveryTime: "48h",
    styles: ["Royal", "Elegant"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/caricature/reception.png",
    previewImages: [],
    bestSeller: true,
    isNew: true,
    description:
      "Reception-style caricature featuring grand outfits and elegant couple poses.",
    whatIncluded: [
      "Reception couple caricature",
      "Outfit detailing",
      "Background enhancement",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
  },

  {
    id: "prod-111",
    title: "Sangeeth Dance Caricature",
    slug: "sangeeth-dance-caricature",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1599,
    tags: ["Caricature", "Sangeeth", "Dance"],
    deliveryTime: "48h",
    styles: ["Fun"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/caricature/sangeeth.png",
    previewImages: [],
    bestSeller: false,
    isNew: true,
    description:
      "Energetic sangeeth caricature capturing dance, joy, and celebration.",
    whatIncluded: [
      "Dance pose caricature",
      "Festive outfits",
      "Colorful theme",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
  },

  {
    id: "prod-112",
    title: "Wedding Day Caricature Portrait",
    slug: "wedding-day-caricature-portrait",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1799,
    tags: ["Caricature", "Wedding", "Bride Groom"],
    deliveryTime: "72h",
    styles: ["Traditional", "Royal"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/caricature/wedding.png",
    previewImages: [],
    bestSeller: true,
    isNew: false,
    description:
      "Premium wedding day caricature portrait with detailed attire and expressions.",
    whatIncluded: [
      "Bride & groom caricature",
      "Detailed outfit illustration",
      "Elegant background",
      "2 revisions",
    ],
    revisionPolicy: "2 revisions included.",
    deliverables: ["High-resolution PNG"],
  },
  /* =====================================================
   CARICATURE – CEREMONY & STYLE VARIANTS
===================================================== */

  {
    id: "prod-113",
    title: "Myra Ceremony Caricature",
    slug: "myra-ceremony-caricature",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1599,
    tags: ["Caricature", "Myra", "Traditional"],
    deliveryTime: "48h",
    styles: ["Traditional"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/caricature/myra.png",
    previewImages: [],
    bestSeller: false,
    isNew: true,
    description:
      "Traditional Myra ceremony caricature illustration capturing family rituals and cultural elegance.",
    whatIncluded: [
      "Myra ceremony caricature",
      "Traditional attire styling",
      "Color customization",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
  },

  {
    id: "prod-114",
    title: "Thilak Ceremony Caricature",
    slug: "thilak-ceremony-caricature",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1599,
    tags: ["Caricature", "Thilak Ceremony", "Traditional"],
    deliveryTime: "48h",
    styles: ["Traditional"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/caricature/thilak-ceremony.png",
    previewImages: [],
    bestSeller: false,
    isNew: true,
    description:
      "Beautiful thilak ceremony caricature representing sacred rituals and family blessings.",
    whatIncluded: [
      "Ceremony pose illustration",
      "Traditional detailing",
      "Theme color matching",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
  },

  {
    id: "prod-115",
    title: "Varmala Ceremony Caricature",
    slug: "varmala-ceremony-caricature",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1699,
    tags: ["Caricature", "Varmala", "Wedding"],
    deliveryTime: "48h",
    styles: ["Traditional", "Royal"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/caricature/varamala.png",
    previewImages: [],
    bestSeller: true,
    isNew: true,
    description:
      "Elegant varmala ceremony caricature capturing the magical exchange of garlands.",
    whatIncluded: [
      "Bride & groom varmala pose",
      "Royal attire illustration",
      "Background enhancement",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
  },

  {
    id: "prod-116",
    title: "Haldi Ceremony Caricature – Updated Style",
    slug: "haldi-ceremony-caricature-updated",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1599,
    tags: ["Caricature", "Haldi", "Updated"],
    deliveryTime: "48h",
    styles: ["Traditional", "Fun"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/caricature/haldi-changed.png",
    previewImages: [],
    bestSeller: true,
    isNew: true,
    description:
      "Updated haldi ceremony caricature with brighter colors and modern expressions.",
    whatIncluded: [
      "Haldi theme caricature",
      "Yellow palette styling",
      "Expression customization",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
  },

  {
    id: "prod-117",
    title: "Reception Caricature – Updated Style",
    slug: "reception-caricature-updated",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1699,
    tags: ["Caricature", "Reception", "Updated"],
    deliveryTime: "48h",
    styles: ["Royal", "Elegant"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/caricature/reception-changed.png",
    previewImages: [],
    bestSeller: true,
    isNew: true,
    description:
      "Updated reception caricature featuring refined outfits and premium styling.",
    whatIncluded: [
      "Reception outfit illustration",
      "Pose enhancement",
      "Luxury background",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
  },

  {
    id: "prod-118",
    title: "Sangeeth Ceremony Caricature – Updated",
    slug: "sangeeth-ceremony-caricature-updated",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1599,
    tags: ["Caricature", "Sangeeth", "Dance"],
    deliveryTime: "48h",
    styles: ["Fun"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/caricature/sangeeth-changed.png",
    previewImages: [],
    bestSeller: false,
    isNew: true,
    description:
      "Dance-themed sangeeth caricature with lively poses and celebration vibes.",
    whatIncluded: [
      "Dance pose caricature",
      "Festive outfit design",
      "Theme colors",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
  },

  {
    id: "prod-119",
    title: "Sangeeth Final Couple Caricature",
    slug: "sangeeth-final-couple-caricature",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1699,
    tags: ["Caricature", "Sangeeth", "Final"],
    deliveryTime: "48h",
    styles: ["Elegant"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/caricature/sangeeth-final.png",
    previewImages: [],
    bestSeller: true,
    isNew: true,
    description:
      "Final sangeeth couple caricature with polished festive look and joyful expressions.",
    whatIncluded: [
      "Final pose caricature",
      "Outfit detailing",
      "Premium styling",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
  },

  {
    id: "prod-120",
    title: "Wedding Ceremony Caricature – Updated",
    slug: "wedding-ceremony-caricature-updated",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1799,
    tags: ["Caricature", "Wedding", "Updated"],
    deliveryTime: "72h",
    styles: ["Traditional", "Royal"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/caricature/wedding-changed.png",
    previewImages: [],
    bestSeller: true,
    isNew: true,
    description:
      "Updated wedding ceremony caricature with royal attire and refined detailing.",
    whatIncluded: [
      "Wedding attire illustration",
      "Premium detailing",
      "Royal theme background",
      "2 revisions",
    ],
    revisionPolicy: "2 revisions included.",
    deliverables: ["High-resolution PNG"],
  },

  {
    id: "prod-121",
    title: "Modern Casual Caricature – Male Style",
    slug: "modern-casual-male-caricature",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 999,
    tags: ["Caricature", "Casual", "Modern"],
    deliveryTime: "24h",
    styles: ["Modern"],
    languages: ["English"],
    thumbnail: "/caricature/02-1.png",
    previewImages: [],
    bestSeller: false,
    isNew: true,
    description:
      "Modern casual caricature perfect for personal branding, profile use, or fun invites.",
    whatIncluded: [
      "Single character caricature",
      "Casual outfit styling",
      "Pose customization",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
  },

  {
    id: "prod-122",
    title: "Classic Couple Caricature – Style 04",
    slug: "classic-couple-caricature-style-04",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1499,
    tags: ["Caricature", "Classic", "Couple"],
    deliveryTime: "48h",
    styles: ["Elegant"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/caricature/04.png",
    previewImages: [],
    bestSeller: false,
    isNew: true,
    description:
      "Classic couple caricature with elegant outfits suitable for all wedding events.",
    whatIncluded: [
      "Couple illustration",
      "Elegant attire",
      "Color customization",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
  },

  {
    id: "prod-123",
    title: "Royal Couple Caricature – Style 05",
    slug: "royal-couple-caricature-style-05",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 1599,
    tags: ["Caricature", "Royal", "Couple"],
    deliveryTime: "48h",
    styles: ["Royal", "Traditional"],
    languages: ["Telugu", "Hindi", "English"],
    thumbnail: "/caricature/05.png",
    previewImages: [],
    bestSeller: true,
    isNew: true,
    description:
      "Royal themed couple caricature designed with majestic outfits and rich detailing.",
    whatIncluded: [
      "Royal couple pose",
      "Premium attire illustration",
      "Theme matching",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
  },

  {
    id: "prod-124",
    title: "Modern Female Caricature – Casual Style",
    slug: "modern-female-caricature-casual",
    category: "digital-invites",
    collection: "Caricature",
    collectionSlug: "caricature",
    priceFrom: 999,
    tags: ["Caricature", "Female", "Modern"],
    deliveryTime: "24h",
    styles: ["Modern"],
    languages: ["English"],
    thumbnail: "/caricature/changed.png",
    previewImages: [],
    bestSeller: false,
    isNew: true,
    description:
      "Modern casual female caricature perfect for profile pictures and creative branding.",
    whatIncluded: [
      "Single character illustration",
      "Casual modern styling",
      "Color customization",
      "1 revision",
    ],
    revisionPolicy: "1 revision included.",
    deliverables: ["High-resolution PNG"],
  },
  {
    id: "prod-125",
    title: "Royal Peacock Monogram Wedding Logo Invitation",
    slug: "royal-peacock-monogram-wedding-logo-invitation",
    category: "digital-invites",
    collection: "Logo Design",
    collectionSlug: "logo",
    priceFrom: 3499,
    tags: [
      "Wedding Logo",
      "Monogram Invite",
      "Peacock Theme",
      "Royal Wedding",
      "Floral Wedding Logo",
      "Hashtag Wedding",
      "Personalized Monogram"
    ],
    deliveryTime: "48h",
    styles: ["Royal", "Floral", "Elegant", "Illustrated", "Romantic", "Creative"],
    languages: ["Hindi", "English"],
    thumbnail: "/logos/1.png",
    previewImages: [
      "/logos/1.png"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "A regal peacock-inspired wedding monogram logo designed with floral elegance and royal charm. Featuring a personalized couple monogram and wedding hashtag, this logo-style digital invite is perfect for couples who want a unique identity for their big day across invitations, videos, and stationery.",
    whatIncluded: [
      "Customized couple monogram initials",
      "Peacock and floral royal frame design",
      "Personalized wedding hashtag integration",
      "High-resolution logo for invites, videos & stationery",
      "Color and theme customization",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for initials, colors, and design refinements.",
    deliverables: [
      "High-resolution PNG (transparent background)",
      "JPG version for sharing",
      "PDF version for print usage"
    ],
    religion: ["Hindu", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian"],
    subOccasion: [
      "Wedding",
      "Wedding Logo",
      "Monogram Design",
      "Hashtag Logo"
    ]
  },
  {
    id: "prod-126",
    title: "Lotus Peacock Monogram Wedding Logo Invitation",
    slug: "lotus-peacock-monogram-wedding-logo-invitation",
    category: "digital-invites",
    collection: "Logo Design",
    collectionSlug: "logo",
    priceFrom: 3299,
    tags: [
      "Wedding Logo",
      "Monogram Invite",
      "Lotus Theme",
      "Peacock Design",
      "Floral Wedding Logo",
      "Elegant Monogram",
      "Personalized Wedding Logo"
    ],
    deliveryTime: "48h",
    styles: ["Floral", "Elegant", "Romantic", "Illustrated", "Creative"],
    languages: ["Hindi", "English"],
    thumbnail: "/logos/2.png",
    previewImages: [
      "/logo/2.png"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "An elegant lotus and peacock inspired wedding monogram logo designed with soft pastel tones and floral beauty. This personalized logo brings together romance, nature, and sophistication, creating a timeless identity for your wedding invites, videos, and stationery.",
    whatIncluded: [
      "Customized couple monogram initials",
      "Lotus floral and peacock illustration theme",
      "Soft pastel color palette customization",
      "High-resolution logo for invites, videos & stationery",
      "Theme and color adjustments as per couple preference",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for initials, colors, and design refinements.",
    deliverables: [
      "High-resolution PNG (transparent background)",
      "JPG version for sharing",
      "PDF version for print usage"
    ],
    religion: ["Hindu", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian"],
    subOccasion: [
      "Wedding",
      "Wedding Logo",
      "Monogram Design",
      "Floral Logo"
    ]
  },
  {
    id: "prod-127",
    title: "Tropical Peacock Monogram Wedding Logo Invitation",
    slug: "tropical-peacock-monogram-wedding-logo-invitation",
    category: "digital-invites",
    collection: "Logo Design",
    collectionSlug: "logo",
    priceFrom: 3399,
    tags: [
      "Wedding Logo",
      "Monogram Invite",
      "Peacock Theme",
      "Tropical Floral Logo",
      "Royal Arch Design",
      "Destination Wedding Logo",
      "Personalized Wedding Logo"
    ],
    deliveryTime: "48h",
    styles: ["Vibrant", "Floral", "Royal", "Creative", "Illustrated", "Celebration"],
    languages: ["Hindi", "English"],
    thumbnail: "/logos/3.png",
    previewImages: [
      "/logos/3.png"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "A vibrant tropical floral wedding monogram logo featuring a royal arch frame and elegant peacock illustration. Designed for couples who love colorful celebrations and destination-style themes, this personalized logo creates a unique identity for wedding invites, videos, and stationery.",
    whatIncluded: [
      "Customized couple monogram initials",
      "Tropical floral and peacock illustration theme",
      "Royal arch frame design",
      "High-resolution logo for invites, videos & stationery",
      "Color and theme customization as per preference",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for initials, colors, and design refinements.",
    deliverables: [
      "High-resolution PNG (transparent background)",
      "JPG version for sharing",
      "PDF version for print usage"
    ],
    religion: ["Hindu", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian"],
    subOccasion: [
      "Wedding",
      "Wedding Logo",
      "Monogram Design",
      "Floral Logo"
    ]
  },
  {
    id: "prod-128",
    title: "Botanical Peacock Monogram Wedding Logo Invitation",
    slug: "botanical-peacock-monogram-wedding-logo-invitation",
    category: "digital-invites",
    collection: "Logo Design",
    collectionSlug: "logo",
    priceFrom: 3299,
    tags: [
      "Wedding Logo",
      "Monogram Invite",
      "Botanical Theme",
      "Peacock Design",
      "Lotus Floral Logo",
      "Elegant Wedding Logo",
      "Personalized Monogram"
    ],
    deliveryTime: "48h",
    styles: ["Elegant", "Floral", "Minimal", "Illustrated", "Romantic", "Creative"],
    languages: ["Hindi", "English"],
    thumbnail: "/logos/4.png",
    previewImages: [
      "/logos/4.png"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "A premium botanical wedding monogram logo featuring soft floral elements, a graceful peacock, and elegant initials at the center. This nature-inspired design creates a sophisticated and timeless identity for your wedding invites, videos, and stationery.",
    whatIncluded: [
      "Customized couple monogram initials",
      "Botanical wreath with peacock and lotus illustration",
      "Elegant minimal floral design theme",
      "High-resolution logo for invites, videos & stationery",
      "Color and theme customization as per couple preference",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for initials, colors, and design refinements.",
    deliverables: [
      "High-resolution PNG (transparent background)",
      "JPG version for sharing",
      "PDF version for print usage"
    ],
    religion: ["Hindu", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian"],
    subOccasion: [
      "Wedding",
      "Wedding Logo",
      "Monogram Design",
      "Botanical Logo"
    ]
  },
  {
    id: "prod-129",
    title: "Couple Story Illustrated Wedding Logo Invitation",
    slug: "couple-story-illustrated-wedding-logo-invitation",
    category: "digital-invites",
    collection: "Logo Design",
    collectionSlug: "wedding-logos",
    priceFrom: 4499,
    tags: [
      "Wedding Logo",
      "Couple Story Logo",
      "Illustrated Wedding Logo",
      "Personalized Artwork",
      "Romantic Wedding Logo",
      "Creative Wedding Invite",
      "Hobby Based Logo"
    ],
    deliveryTime: "72h",
    styles: ["Illustrated", "Creative", "Romantic", "Vibrant", "Storytelling", "Celebration"],
    languages: ["Hindi", "English"],
    thumbnail: "/logos/5.png",
    previewImages: [
      "/logos/5.png"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "A beautifully illustrated wedding logo that tells the couple’s story through their favorite things, memories, and moments. From food and movies to coffee dates and city lights, this personalized artwork transforms your journey into a unique wedding logo perfect for invites, videos, and stationery.",
    whatIncluded: [
      "Customized couple illustration artwork",
      "Integration of hobbies, memories & favorite elements",
      "Personalized monogram initials and names",
      "Story-based creative wedding logo design",
      "High-resolution logo for invites, videos & stationery",
      "3 revision rounds"
    ],
    revisionPolicy:
      "3 revision rounds included for elements, colors, and illustration refinements.",
    deliverables: [
      "High-resolution PNG (transparent background)",
      "JPG version for sharing",
      "PDF version for print usage"
    ],
    religion: ["Hindu", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian"],
    subOccasion: [
      "Wedding",
      "Wedding Logo",
      "Couple Story Logo",
      "Illustrated Logo"
    ]
  },
  {
    id: "prod-130",
    title: "Royal Gold Monogram Typography Wedding Logo",
    slug: "royal-gold-monogram-typography-wedding-logo",
    category: "digital-invites",
    collection: "Logo Design",
    collectionSlug: "logo",
    priceFrom: 2499,
    tags: [
      "Wedding Logo",
      "Monogram Logo",
      "Typography Logo",
      "Minimal Wedding Logo",
      "Royal Initials",
      "Golden Logo",
      "Elegant Wedding Logo"
    ],
    deliveryTime: "24h",
    styles: ["Minimal", "Elegant", "Royal", "Creative"],
    languages: ["Hindi", "English"],
    thumbnail: "/logos/6.png",
    previewImages: [
      "/logos/6.png"
    ],
    bestSeller: true,
    isNew: true,
    description:
      "A premium gold typography monogram wedding logo designed with elegant initials and refined lettering. Perfect for couples who prefer a clean, royal, and minimal identity for their wedding invites, videos, and stationery.",
    whatIncluded: [
      "Customized couple monogram initials",
      "Elegant gold typography design",
      "Name placement below monogram",
      "High-resolution logo for invites, videos & stationery",
      "Color customization options",
      "2 revision rounds"
    ],
    revisionPolicy:
      "2 revision rounds included for initials, font, and color refinements.",
    deliverables: [
      "High-resolution PNG (transparent background)",
      "JPG version for sharing",
      "PDF version for print usage"
    ],
    religion: ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Other"],
    region: ["South Indian", "North Indian", "East Indian", "West Indian", "Other"],
    subOccasion: [
      "Wedding",
      "Wedding Logo",
      "Monogram Design",
      "Typography Logo"
    ]
  },

  {
  id: "prod-131",
  title: "Sikh Wedding Invitation Video | Anand Karaj Digital Invite",
  slug: "sikh-wedding-anand-karaj-digital-invite",
  category: "digital-invites",
  collection: "Wedding Invites",
  collectionSlug: "wedding-invites",
  priceFrom: 1999,
  tags: ["Sikh Wedding", "Anand Karaj", "Digital Invite", "Wedding Video", "Punjabi Invite"],
  deliveryTime: "48h",
  styles: ["Traditional", "Elegant", "Cinematic", "Emotional", "Romantic"],
  languages: ["Punjabi", "Hindi", "English"],
  thumbnail: "/images/products/sikh-anand-karaj-thumbnail.jpg",
  previewImages: [
    "/images/products/sikh-anand-karaj-1.jpg",
    "/images/products/sikh-anand-karaj-2.jpg"
  ],
  bestSeller: false,
  isNew: true,
  description:
    "A beautifully crafted Sikh wedding invitation video capturing the sacred Anand Karaj ceremony. Celebrate grace, faith, and love as two souls begin their forever with blessings from the Guru Granth Sahib. Perfect for couples looking for a spiritual and elegant digital invite.",
  whatIncluded: [
    "Personalized wedding invitation video",
    "Custom names, date, and venue details",
    "Background music with spiritual tone",
    "HD video output",
    "1 theme customization"
  ],
  revisionPolicy: "Up to 2 free revisions included. Additional revisions will be charged.",
  deliverables: [
    "Full HD video file (MP4)",
    "Mobile-optimized version",
    "Shareable link"
  ],
  video: {
    url: "https://youtube.com/shorts/h1NbqgVi0aw",
    platform: "youtube"
  },
  religion: ["Sikh"],
  region: ["North Indian"],
  subOccasion: ["Wedding", "Anand Karaj Ceremony"]
},
{
   id: "prod-132",
  title: "1st Birthday Invitation Video | Cute Baby Digital Invite",
  slug: "1st-birthday-cute-baby-digital-invite",
  category: "digital-invites",
  collection: "Birthday",
  collectionSlug: "birthday",
  priceFrom: 1499,
  tags: ["1st Birthday", "Baby Invite", "Birthday Video", "Cute Invite", "Digital Invitation"],
  deliveryTime: "48h",
  styles: ["Cute", "Playful", "Fun", "Animated", "Celebration"],
  languages: ["English", "Hindi"],
  thumbnail: "/images/products/1st-birthday-thumbnail.jpg",
  previewImages: [
    "/images/products/1st-birthday-1.jpg",
    "/images/products/1st-birthday-2.jpg"
  ],
  bestSeller: false,
  isNew: true,
  description:
    "A heartwarming 1st birthday invitation video designed to create lasting family memories. Even if your little one won’t remember the day, this cute and personalized digital invite sets the perfect mood for the celebration and becomes a cherished keepsake forever.",
  whatIncluded: [
    "Personalized birthday invitation video",
    "Baby name, age, date, and venue customization",
    "Cute animations and music",
    "HD video output",
    "1 theme customization"
  ],
  revisionPolicy: "Up to 2 free revisions included. Additional revisions will be charged.",
  deliverables: [
    "Full HD video file (MP4)",
    "Mobile-optimized version",
    "Shareable link"
  ],
  video: {
    url: "https://youtube.com/shorts/JN7pVJ2oPo8",
    platform: "youtube"
  },
  religion: ["Other"],
  region: ["Other"],
  subOccasion: ["1st Birthday"]
},
{
  id: "prod-133",
  title: "Royal Palace Wedding Invitation Video | Cinematic Digital Wedding Invite",
  slug: "royal-palace-cinematic-wedding-invite",
  category: "digital-invites",
  collection: "Wedding Invites",
  collectionSlug: "wedding-invites",
  priceFrom: 2499,
  tags: ["Royal Wedding", "Palace Theme", "Cinematic Invite", "Luxury Wedding", "Digital Invitation"],
  deliveryTime: "48h",
  styles: ["Royal", "Luxury", "Cinematic", "Elegant", "Romantic"],
  languages: ["English", "Hindi"],
  thumbnail: "/images/products/royal-palace-thumbnail.jpg",
  previewImages: [
    "/images/products/royal-palace-1.jpg",
    "/images/products/royal-palace-2.jpg"
  ],
  bestSeller: false,
  isNew: true,
  description:
    "A grand cinematic wedding invitation inspired by royal palaces and timeless love stories. Featuring majestic marble arches, luxurious floral aesthetics, and regal storytelling, this digital invite transforms your wedding announcement into a royal experience for your guests.",
  whatIncluded: [
    "Personalized wedding invitation video",
    "Custom names, wedding date, and venue details",
    "Royal palace theme with cinematic effects",
    "Premium background music",
    "HD video output"
  ],
  revisionPolicy: "Up to 2 free revisions included. Additional revisions will be charged.",
  deliverables: [
    "Full HD video file (MP4)",
    "Mobile-optimized version",
    "Shareable link"
  ],
  video: {
    url: "https://youtube.com/shorts/eoj5Az5KeZU",
    platform: "youtube"
  },
  religion: ["Hindu", "Muslim", "Christian", "Other"],
  region: ["North Indian", "South Indian", "West Indian", "East Indian", "Other"],
  subOccasion: ["Wedding"]
},

{
  id: "prod-134",
  title: "Telugu Reception Invitation Video | Cinematic Car Entry Digital Invite",
  slug: "telugu-reception-cinematic-car-entry-invite",
  category: "digital-invites",
  collection: "Wedding Invites",
  collectionSlug: "wedding-invites",
  priceFrom: 1999,
  tags: ["Reception Invite", "Telugu Invite", "Car Entry", "Cinematic Invite", "Wedding Reception"],
  deliveryTime: "48h",
  styles: ["Cinematic", "Royal", "Modern", "Storytelling", "Celebration"],
  languages: ["Telugu", "English"],
  thumbnail: "/images/products/telugu-reception-thumbnail.jpg",
  previewImages: [
    "/images/products/telugu-reception-1.jpg",
    "/images/products/telugu-reception-2.jpg"
  ],
  bestSeller: false,
  isNew: true,
  description:
    "A grand Telugu reception invitation video featuring a cinematic car entry and storytelling experience. Designed to feel like a movie premiere, this digital invite sets the tone for a luxurious and unforgettable reception celebration.",
  whatIncluded: [
    "Personalized reception invitation video",
    "Custom names, date, and venue details",
    "Cinematic car entry sequence",
    "Background music with dramatic storytelling",
    "HD video output"
  ],
  revisionPolicy: "Up to 2 free revisions included. Additional revisions will be charged.",
  deliverables: [
    "Full HD video file (MP4)",
    "Mobile-optimized version",
    "Shareable link"
  ],
  video: {
    url: "https://youtube.com/shorts/88qi9-EKhDI",
    platform: "youtube"
  },
  religion: ["Hindu", "Other"],
  region: ["South Indian"],
  subOccasion: ["Reception"]
},



];

export const processSteps = [
  {
    id: 1,
    title: 'Logo Design',
    description: 'We create a unique couple monogram or wedding logo that reflects your personality.',
    turnaround: '24-48 hours',
    icon: 'Palette',
  },
  {
    id: 2,
    title: 'Caricature',
    description: 'Our artists craft a fun, personalized caricature of you and your partner.',
    turnaround: '48-72 hours',
    icon: 'PenTool',
  },
  {
    id: 3,
    title: 'Slides Design',
    description: 'We design beautiful invitation slides with all your event details.',
    turnaround: '24-48 hours',
    icon: 'Layers',
  },
  {
    id: 4,
    title: 'Video Preview',
    description: 'Review your video invitation draft with background music and animations.',
    turnaround: '48-72 hours',
    icon: 'Play',
  },
  {
    id: 5,
    title: 'Revisions',
    description: 'We make adjustments based on your feedback to perfect every detail.',
    turnaround: '24-48 hours',
    icon: 'RefreshCw',
  },
  {
    id: 6,
    title: 'Final Delivery',
    description: 'Receive your final invitation in multiple formats ready to share.',
    turnaround: 'Same day',
    icon: 'CheckCircle',
  },
];

export const testimonials = [
  {
    id: 1,
    name: "Rohan Gandhi",
    location: "Hyderabad",
    text: `
Thank you so much for the amazing Save the Date video! It has turned out beautifully, and our guests absolutely loved it. The AI characters look strikingly close to real, and the storyline has been portrayed amazingly. Our favourite moment was the transition from the movie scene into the proposal — it felt magical. Even the music perfectly complements the overall vibe.
Also, the logo has also given a clear and beautiful storyline, keeping everything clean and well-crafted while showing all the small details of our journey.
We’re excited and looking forward to the wedding invite now.
A special thanks to @Michey Prashanth Luring Invite and the whole design team for creating such a lovely illustrated video for us.`,
    rating: 5,
    occasion: "Wedding",
    image:
      "/assets/Rohan.jpeg",
  },
  {
    id: 2,
    name: "Tanya Arora",
    location: "Vijayawada",
    text: "They created a beautiful digital wedding video for my sister. It was elegant, heartfelt, and perfectly captured the occasion. Highly recommend!",
    rating: 5,
    occasion: "Anniversary",
    image:
      "/assets/TanyaArora.png",
  },
  {
    id: 3,
    name: "Aditi Ghosal",
    location: "Chennai",
    text: "The most hardworking lot I have come across in recent times. They”ll patiently listen to all your asks and will ensure they deliver the best. Thankyou for your creation. Go ahead and book them for your special day without a DOUBT!!!",
    rating: 5,
    occasion: "Wedding",
    image:
      "/assets/AditiGhosal.jpg",
  },
  {
    id: 4,
    name: "srishti jain",
    location: "Bangalore",
    text: `The services were very nice. Timely responses and lovely creatives.
The team was super supportive , enthusiastic and accommodating.
We had a lovely experience and loved the final pieces.`,
    rating: 5,
    occasion: "House Warming",
    image:
      "/assets/srishtijain.png",
  },
  {
    id: 5,
    name: "Kamya Purohit",
    location: "Guntur",
    text: "Great output, on time response, amazing quality of work, polite and humble ppl to talk to. Amazing experience. Multiple iterations were done and they did it really well. Thank you. Great work",
    rating: 5,
    occasion: "Wedding",
    image:
      "/assets/KamyaPurohit.jpg",
  },
  {
    id: 6,
    name: "Suruchi Kabra",
    location: "Pune",
    text: "Thanks to Gurleen Mam n her Amazing superb team for making such a beautiful e-invite,they have nailed each point of discussions very well....n patiently listen to ur all requirements n their for u anytime for any changes or suggestions....absolutely proud of this team.. hat's off to der excellent work..n totally trust worthy🙏😍",
    rating: 5,
    occasion: "Wedding",
    image:
      "/assets/SuruchiKabra.jpg",
  },
  {
    id: 7,
    name: "S_ Kibo",
    location: "Pune",
    text: "Wonderful experience working with the team at luring invites, its a very interactive and joint effort in making the vision come to life, the team actively listens to and promptly makes the required edits to make the invitation truly tailored to your story and narrative 😍✨ highly recommend!! 👍",
    rating: 5,
    occasion: "Wedding",
    image:
      "/assets/S_Kibo.jpg",
  },
];


export const faqs = [
  {
    question: 'How long does it take to receive my invitation?',
    answer: 'Delivery times vary based on the package: PDF invites take 24 hours, standard digital invites take 24-48 hours, and AI video invitations take 48-72 hours. Rush delivery is available for an additional fee.',
  },
  {
    question: 'Can I request changes after receiving the preview?',
    answer: 'Yes! Each package includes revision rounds. PDF invites include 1 revision, standard packages include 2 revisions, and premium packages include 3 revisions. Additional revisions are available at ₹500 each.',
  },
  {
    question: 'What information do I need to provide?',
    answer: 'We need event details (names, dates, venues, timings), your photos (for caricatures/videos), preferred style/colors, and any specific text or religious requirements.',
  },
  {
    question: 'Do you offer services in multiple languages?',
    answer: 'Yes! We offer invitations in Telugu, Hindi, and English. Multi-language invitations are also available upon request.',
  },
  {
    question: 'What formats will I receive?',
    answer: 'You will receive high-resolution files suitable for sharing on WhatsApp, Instagram, and other platforms. Video invites come in MP4 format optimized for social media. Print-ready files are included in premium packages.',
  },
  {
    question: 'How do I share my photos and requirements?',
    answer: 'After placing your enquiry, we will share a detailed form and a secure link where you can upload all your photos and provide your requirements.',
  },
];

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find((p) => p.slug === slug);
};

export const getCollectionBySlug = (slug: string): Collection | undefined => {
  return collections.find((c) => c.slug === slug);
};

export const getProductsByCollection = (collectionSlug: string): Product[] => {
  return products.filter((p) => p.collectionSlug === collectionSlug);
};

export const getBestSellers = (): Product[] => {
  return products.filter((p) => p.bestSeller);
};

export const getNewProducts = (): Product[] => {
  return products.filter((p) => p.isNew);
};
export interface TrendingVideoItem {
  id: string;
  productSlug: string; // connects this video to a product (for View + WhatsApp)
  platform: 'local' | 'youtube' | 'instagram' | 'pinterest';
  url: string; // video link (IG/YT/Pinterest) or local mp4 path
  thumbnail?: string; // optional (recommended for IG/Pinterest)
}

export const trendingVideos: TrendingVideoItem[] = [
  {
    id: 'tv-1',
    productSlug: 'royal-3d-palace-invitation',
    platform: 'youtube',
    url: 'https://youtube.com/shorts/nXvMTCadXEc?si=cU_o-wRQqLNB2OUg',
    // thumbnail optional
  },
  // Example YouTube (replace with yours)
  {
    id: 'tv-2',
    productSlug: 'love-story-timeline',
    platform: 'youtube',
    url: 'https://youtube.com/shorts/TjfS3ntM5-Y?si=7lGBaW_-jNB-cwHa',
  },
  // Example Local MP4 (put file in /public/videos/)
  {
    id: 'tv-3',
    productSlug: 'modern-minimal-ai-video',
    platform: 'youtube',
    url: 'https://youtube.com/shorts/I82HExqjZjY?si=g7S85R2mItq8g3wO',
    // thumbnail optional for youtube videos too (poster)
    // thumbnail: '/videos/sample-poster.jpg',
  },
  {
    id: 'tv-4',
    productSlug: 'modern-minimal-ai-video',
    platform: 'youtube',
    url: 'https://youtube.com/shorts/Unr1igZThjs?si=2uNLb3z3gtFN2VYD',
    // thumbnail optional for youtube videos too (poster)
    // thumbnail: '/videos/sample-poster.jpg',
  },
  {
    id: 'tv-5',
    productSlug: 'modern-minimal-ai-video',
    platform: 'youtube',
    url: 'https://youtube.com/shorts/FCO0Q7eHxew?si=Q8xLTyBWDVkQnzt1',
    // thumbnail optional for youtube videos too (poster)
    // thumbnail: '/videos/sample-poster.jpg',
  },
  {
    id: 'tv-6',
    productSlug: 'modern-minimal-ai-video',
    platform: 'youtube',
    url: 'https://youtube.com/shorts/RmnkLZ-Ov5w?si=AQ9RfDYFKBfiEtSw',
    // thumbnail optional for local videos too (poster)
    // thumbnail: '/videos/sample-poster.jpg',
  },
];

export const getTrendingVideosWithProducts = () => {
  return trendingVideos
    .map((v) => {
      const product = products.find((p) => p.slug === v.productSlug);
      if (!product) return null;
      return { ...v, product };
    })
    .filter(Boolean) as Array<TrendingVideoItem & { product: Product }>;
};