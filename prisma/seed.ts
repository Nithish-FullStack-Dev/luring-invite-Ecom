import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { normalizeConfigForEditor } from "../lib/template-config";

const prisma = new PrismaClient();

const legacyTemplate11 = {
  hashtag: {
    type: "text", text: "#sivvalasandhya", font: "PlayfairDisplay-Bold.ttf",
    fontSize: 36, fontColor: "#000000", x: "center", y: 300, start: 2, end: 4,
  },
  intro: {
    type: "text", text: "With the heavenly blessings of", font: "OpenSans-Regular.ttf",
    fontSize: 24, fontColor: "#000000", x: "center", y: 350, start: 4, end: 6,
  },
  name1: {
    type: "text", text: "Sandhya", font: "GreatVibes-Regular.ttf",
    fontSize: 60, fontColor: "crimson", x: "center", y: 450, start: 6, end: 8,
  },
  and: {
    type: "text", text: "&", font: "OpenSans-Regular.ttf", fontSize: 28,
    fontColor: "#000000", x: "center", y: 515, start: 7.5, end: 8.5,
  },
  name2: {
    type: "text", text: "Anil Kumar", font: "GreatVibes-Regular.ttf",
    fontSize: 60, fontColor: "crimson", x: "center", y: 560, start: 8, end: 10,
  },
  datetime: {
    type: "text", text: "20-12-2025", font: "OpenSans-Bold.ttf", fontSize: 30,
    fontColor: "#000000", x: "center", y: 620, start: 10, end: 12,
  },
  venue: {
    type: "text", text: "Venue: Bouncy Bunch KidsPlay", font: "OpenSans-Regular.ttf",
    fontSize: 24, fontColor: "#000000", x: "center", y: 720, start: 12, end: 15,
  },
};

const configHaldi = {
  texts: [
    {
      key: "Names", text: "Ritesh & Varsha", font: "GreatVibes-Regular.ttf",
      fontSize: 94, fontColor: "#b00044", x: "center", y: 720,
    },
    {
      key: "Intro", text: "A bond written in the stars &\nsealed with love", font: "Philosopher-Regular.ttf",
      fontSize: 42, fontColor: "#3B2B24", x: "center", y: 360,
    },
  ],
  imageSize: { width: 1080, height: 1920 },
};

const configWelcome = {
  texts: [
    {
      key: "Monogram", text: "R & V", font: "chopinscript.ttf", fontSize: 120,
      fontColor: "#000000", x: "center", y: 180,
    },
    {
      key: "Welcome text", text: "A bond written in the stars\nsealed with love",
      font: "Philosopher-Regular.ttf", fontSize: 54, fontColor: "#3B2B24",
      x: "center", y: 460,
    },
  ],
  imageSize: { width: 1080, height: 1920 },
};

const configFamily = {
  texts: [
    {
      key: "Blessings", text: "With the heavenly blessings of\nLate Sri. Amarchandji Katariya\n& Maina Devi",
      fontFile: "Philosopher-Regular.ttf", fontSize: 40, fontColor: "#5a3a1c",
      x: "center", y: 400, enable: "between(t,0,20)",
    },
    {
      key: "Family names", text: "Goutham Chand Katariya\n& Sunitha Katariya",
      fontFile: "Philosopher-Regular.ttf", fontSize: 40, fontColor: "#5a3a1c",
      x: "center", y: 480, enable: "between(t,1,20)",
    },
    {
      key: "Invitation", text: "Are cordially inviting you\nto the wedding ceremony\nof their beloved son",
      fontFile: "Philosopher-Regular.ttf", fontSize: 40, fontColor: "#5a3a1c",
      x: "center", y: 560, enable: "between(t,2,20)",
    },
    {
      key: "Name 1", text: "Ritesh", fontFile: "chopinscript.ttf", fontSize: 120,
      fontColor: "#b00044", x: "center", y: 690, enable: "between(t,3,20)",
    },
    {
      key: "Connector", text: "with", fontFile: "Philosopher-Regular.ttf", fontSize: 30,
      fontColor: "#5a3a1c", x: "center", y: 845, enable: "between(t,5,20)",
    },
    {
      key: "Name 2", text: "Varsha", fontFile: "chopinscript.ttf", fontSize: 120,
      fontColor: "#b00044", x: "center", y: 890, enable: "between(t,6,20)",
    },
    {
      key: "Family details", text: "(G D/o Late Sri Bhavarlal ji Bohra\n& Late Smt Pista Bai)\n(D/o Late Sri Mahendra Bohra\nand Sapna Bohra)",
      fontFile: "Philosopher-Regular.ttf", fontSize: 32, fontColor: "#5a3a1c",
      x: "center", y: 1100, enable: "between(t,8,20)",
    },
  ],
  imageSize: { width: 1080, height: 1920 },
};

async function main() {
  const wedding = await prisma.category.upsert({
    where: { slug: "wedding" },
    update: { name: "Wedding" },
    create: { name: "Wedding", slug: "wedding" },
  });

  const birthday = await prisma.category.upsert({
    where: { slug: "birthday" },
    update: { name: "Birthday" },
    create: { name: "Birthday", slug: "birthday" },
  });

  const firstBirthday = await prisma.category.upsert({
    where: { slug: "first-birthday" },
    update: { name: "First Birthday", parentId: birthday.id },
    create: { name: "First Birthday", slug: "first-birthday", parentId: birthday.id },
  });

  const rows = [
    {
      id: 11,
      title: "Sivvala Sandhya — Family Invitation",
      slug: "sivvala-sandhya-family-invitation",
      description: "Personalize names, dates, blessings and venue details in this invitation template.",
      thumbnail: "media/uploads/1750239779_Thumbnail.jpg",
      previewVideo: "media/templates/1750239779_SP Engagement Invitation.mp4",
      sourceVideo: "media/templates/1750239779_blank_template1.mp4",
      price: new Prisma.Decimal("1500.00"),
      durationSeconds: 20,
      legacyPlaceholderConfig: legacyTemplate11 as Prisma.InputJsonValue,
      categoryIds: [birthday.id, firstBirthday.id],
      frames: [
        {
          frameNumber: 1,
          title: "Family details",
          sourceVideo: "media/templates/1750239779_blank_template1.mp4",
          previewImage: "media/uploads/1750239779_Thumbnail.jpg",
          placeholderConfig: normalizeConfigForEditor(legacyTemplate11) as Prisma.InputJsonValue,
          durationSeconds: 20,
        },
      ],
    },
    {
      id: 12,
      title: "Ritesh & Varsha — Haldi",
      slug: "ritesh-varsha-haldi",
      description: "A traditional Haldi invitation with editable names and welcome text.",
      thumbnail: "media/uploads/1750316175_1 (6).jpg",
      previewVideo: "media/templates/1750316175_WhatsApp Video 2025-06-17 at 15.36.29.mp4",
      sourceVideo: "media/templates/1750316175_frame1_template1.mp4",
      price: new Prisma.Decimal("1500.00"),
      durationSeconds: 20,
      legacyPlaceholderConfig: configHaldi as Prisma.InputJsonValue,
      categoryIds: [wedding.id],
      frames: [
        {
          frameNumber: 1,
          title: "Haldi",
          sourceVideo: "media/templates/1750316175_frame1_template1.mp4",
          previewImage: "media/uploads/1750316175_frame1_1 (6).jpg",
          placeholderConfig: configHaldi as Prisma.InputJsonValue,
          durationSeconds: 20,
        },
      ],
    },
    {
      id: 13,
      title: "Ritesh & Varsha — Wedding Invitation",
      slug: "ritesh-varsha-wedding-invitation",
      description: "A multi-frame invitation with editable family details, names and welcome text.",
      thumbnail: "media/uploads/1750322132_1.jpg",
      previewVideo: "media/templates/1750322132_WhatsApp Video 2025-06-17 at 15.36.29.mp4",
      sourceVideo: "media/templates/1750322132_frame1_1.mp4",
      price: new Prisma.Decimal("1500.00"),
      durationSeconds: 40,
      legacyPlaceholderConfig: configWelcome as Prisma.InputJsonValue,
      categoryIds: [wedding.id],
      frames: [
        {
          frameNumber: 1,
          title: "Welcome",
          sourceVideo: "media/templates/1750322132_frame1_1.mp4",
          previewImage: "media/uploads/1750322132_frame1_1.jpg",
          placeholderConfig: configWelcome as Prisma.InputJsonValue,
          durationSeconds: 10,
        },
        {
          frameNumber: 2,
          title: "Family details",
          sourceVideo: "media/templates/1750322132_frame2_3.mp4",
          previewImage: "media/uploads/1750322132_frame2_3.jpg",
          placeholderConfig: configFamily as Prisma.InputJsonValue,
          durationSeconds: 20,
        },
      ],
    },
    {
      id: 14,
      title: "Sample Video Render Test",
      slug: "sample-video-render-test",
      description: "A sample clip included in the supplied project archive for checking FFmpeg text rendering and the download flow.",
      thumbnail: "media/uploads/1750855125_2.jpg",
      previewVideo: "media/templates/1750855125_frame5_5.mp4",
      sourceVideo: "media/templates/1750855125_frame5_5.mp4",
      price: new Prisma.Decimal("299.00"),
      durationSeconds: 5,
      legacyPlaceholderConfig: {
        texts: [
          { key: "Heading", text: "Your Invitation", font: "PlayfairDisplay-Bold.ttf", fontSize: 62, fontColor: "#5a3a1c", x: "center", y: 500 },
          { key: "Details", text: "Add your event details here", font: "OpenSans-Regular.ttf", fontSize: 34, fontColor: "#5a3a1c", x: "center", y: 620 }
        ],
        imageSize: { width: 1080, height: 1920 }
      } as Prisma.InputJsonValue,
      categoryIds: [wedding.id],
      frames: [
        {
          frameNumber: 1,
          title: "Sample render test",
          sourceVideo: "media/templates/1750855125_frame5_5.mp4",
          previewImage: "media/uploads/1750855125_frame5_5.jpg",
          placeholderConfig: {
            texts: [
              { key: "Heading", text: "Your Invitation", font: "PlayfairDisplay-Bold.ttf", fontSize: 62, fontColor: "#5a3a1c", x: "center", y: 500 },
              { key: "Details", text: "Add your event details here", font: "OpenSans-Regular.ttf", fontSize: 34, fontColor: "#5a3a1c", x: "center", y: 620 }
            ],
            imageSize: { width: 1080, height: 1920 }
          } as Prisma.InputJsonValue,
          durationSeconds: 5,
        },
      ],
    },
  ];

  for (const row of rows) {
    const { categoryIds, frames, ...templateData } = row;

    await prisma.template.upsert({
      where: { id: row.id },
      update: templateData,
      create: templateData,
    });

    await prisma.templateCategory.deleteMany({ where: { templateId: row.id } });
    await prisma.templateCategory.createMany({
      data: categoryIds.map((categoryId) => ({ templateId: row.id, categoryId })),
    });

    await prisma.templateFrame.deleteMany({ where: { templateId: row.id } });
    await prisma.templateFrame.createMany({
      data: frames.map((frame) => ({ ...frame, templateId: row.id })),
    });
  }

  const music = [
    {
      title: "South Indian Wedding Music",
      path: "media/music/1757059971_South Indian Wedding Music.mp3",
    },
    {
      title: "Background Track 1750932116",
      path: "media/music/1750932116_1.mp3",
    },
    {
      title: "Background Track 1750855125",
      path: "media/music/1750855125_1.mp3",
    },
  ];

  for (const track of music) {
    await prisma.musicTrack.upsert({
      where: { path: track.path },
      update: { title: track.title, enabled: true },
      create: { ...track, enabled: true },
    });
  }

  // Explicit seeded IDs (11-14) must advance PostgreSQL's serial sequence so future inserts don't collide.
  await prisma.$queryRaw`SELECT setval(pg_get_serial_sequence('"Template"', 'id'), GREATEST(COALESCE((SELECT MAX("id") FROM "Template"), 1), 1), true)`;
  await prisma.$queryRaw`SELECT setval(pg_get_serial_sequence('"TemplateFrame"', 'id'), GREATEST(COALESCE((SELECT MAX("id") FROM "TemplateFrame"), 1), 1), true)`;

  console.log("Seed complete: categories, templates, frames and music tracks created.");
  console.log("Important: restore the original source videos under public/media/templates before generating videos.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
