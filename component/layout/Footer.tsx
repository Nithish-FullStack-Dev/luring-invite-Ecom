// component\layout\Footer.tsx
"use client";
import {
  FaPinterestP,
  FaFacebookF,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import { usePublicContent } from "@/component/cms/PublicContentProvider";
import { defaults } from "@/data/cms";
import { motion } from "framer-motion";
import { collections } from "@/data/products";
import Link from "next/link";
// import { Button } from "@/component/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "../ui/button";

export default function Footer() {
  const cms = usePublicContent();
  const footer = cms.footer ?? defaults.footer;
  const contact = cms.contact ?? defaults.contact;
  const socialIcons = {
    Instagram: FaInstagram,
    Facebook: FaFacebookF,
    YouTube: FaYoutube,
    Pinterest: FaPinterestP,
    LinkedIn: FaLinkedin,
  };
  const openWhatsApp = () => {
    const message = encodeURIComponent(
      "Hi! I'm interested in your invitation services. Can you help me?",
    );
    window.open(
      `https://api.whatsapp.com/send?phone=${contact.whatsapp}&text=${message}`,
      "_blank",
    );
  };

  return (
    <footer className="bg-foreground text-background">
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-primary-glow py-12">
        <div className="container-custom text-center">
          <h3 className="font-heading text-3xl md:text-4xl text-primary-foreground mb-4">
            Ready to Create Your Dream Invitation?
          </h3>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Let us help you make your special occasion unforgettable with our
            premium digital invitations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="heroOutline"
              onClick={openWhatsApp}
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Talk on WhatsApp
            </Button>
            <Link href="/contact">
              <Button
                variant="heroOutline"
                // size="xl"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
              >
                <Mail className="w-5 h-5" />
                Send Email
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div>
              <Link href="/" className="relative h-20 flex items-center">
                <motion.img
                  layoutId="site-logo"
                  src="/whitelogo.png"
                  alt="Logo"
                  className="h-24 w-auto object-contain"
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </Link>
              <p className="text-white/80 text-sm mb-6">{footer.text}</p>
              <div className="flex flex-wrap">
                {footer.socialLinks.map((link) => {
                  const Icon =
                    socialIcons[link.label as keyof typeof socialIcons];
                  return (
                    <a
                      key={link.label + link.url}
                      href={link.url}
                      aria-label={link.label}
                      className="min-w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/40 transition-colors"
                    >
                      {Icon ? (
                        <Icon className="w-7 h-7" />
                      ) : (
                        <span className="text-xs px-2">{link.label}</span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-white/80 hover:text-primary transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/collections"
                    className="text-white/80 hover:text-primary transition-colors"
                  >
                    Collections
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-white/80 hover:text-primary transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                {/* <li><Link to="/process" className="text-white/80 hover:text-primary transition-colors">How It Works</Link></li> */}
                <li>
                  <Link
                    href="/contact"
                    className="text-white/80 hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-white/80 hover:text-primary transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Collections */}
            <div>
              <h4 className="font-semibold mb-6">Collections</h4>
              <ul className="space-y-3">
                {collections.slice(0, 6).map((collection) => (
                  <li key={collection.id}>
                    <Link
                      href={`/collections/${collection.slug}`}
                      className="text-white/80 hover:text-primary transition-colors"
                    >
                      {collection.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-white/80">{contact.phone}</p>
                    <p className="text-xs text-white/80/70">{contact.hours}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-white/80">{contact.email}</p>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-white/80">{contact.location}</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/80/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/80">
              © {new Date().getFullYear()} {footer.copyright}
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-white/80 hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-white/80 hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
