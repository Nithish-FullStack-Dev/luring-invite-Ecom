import type { ContentMap } from "../lib/cms/schema";
// Existing copy only; no server or administrator data.
export const defaults: ContentMap = {
  hero: {
    heading: "Where Dreams Meet Innovation",
    description:
      "Every occasion becomes a cherished memory with our stunning AI-powered digital invitations. From weddings to celebrations, we craft unforgettable experiences.",
  },
  about: {
    heading: "About Us",
    description:
      "Transforming celebrations with innovative digital invitations that capture emotion, elegance, and joy",
    paragraphs: [
      "At Outright's Luring Invite, we believe every celebration begins with an invitation that sets the perfect tone — one that reflects your unique story and leaves a lasting impression.",
    ],
  },
  contact: {
    phone: "+91 9121080131",
    email: "outrightluringinvite@gmail.com",
    location: "Hyderabad, Telangana, India",
    hours: "Mon - Sat: 10AM - 7PM",
    whatsapp: "919121080131",
  },
  navigation: {
    links: [
      { label: "WEDDING", url: "/collections/wedding-invites" },
      { label: "BIRTHDAY", url: "/collections/birthday" },
      { label: "ANNIVERSARY", url: "/collections/anniversary" },
      { label: "HOUSEWARMING", url: "/collections/house-warming" },
      { label: "PDF INVITES", url: "/collections/pdf-invites" },
      { label: "ABOUT", url: "/about" },
      { label: "CONTACT", url: "/contact" },
    ],
  },
  footer: {
    text: "Where dreams meet innovation, and every occasion becomes a cherished memory.",
    copyright: "Outright's Luring Invite. All rights reserved.",
    socialLinks: [
      {
        label: "Instagram",
        url: "https://www.instagram.com/outrightsluringinvite/",
      },
      { label: "Facebook", url: "https://www.facebook.com/outrightluring" },
      { label: "YouTube", url: "https://www.youtube.com/@LuringInvite" },
      { label: "Pinterest", url: "https://in.pinterest.com/luringinvite/" },
      { label: "LinkedIn", url: "https://www.linkedin.com/in/luring-invite/" },
    ],
  },
};
