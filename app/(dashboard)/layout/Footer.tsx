"use client";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { collections } from "@/data/products";
import Link from "next/link";
import { Button } from "@/component/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const openWhatsApp = () => {
    const message = encodeURIComponent(
      "Hi! I'm interested in your invitation services. Can you help me?",
    );
    window.open(
      `https://api.whatsapp.com/send?phone=91 9121080131&text=${message}`,
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
              size="xl"
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
                size="xl"
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
              <p className="text-white/80 text-sm mb-6">
                Where dreams meet innovation, and every occasion becomes a
                cherished memory.
              </p>
              <div className="flex">
                <a
                  href="https://www.instagram.com/outrightsluringinvite/"
                  className="w-10 h-10 rounded-full  flex items-center justify-center hover:bg-primary/40 transition-colors"
                >
                  <FaInstagram className="w-7 h-7" />
                </a>
                <a
                  href="https://www.facebook.com/outrightluring"
                  className="w-10 h-10 rounded-full  flex items-center justify-center hover:bg-primary/40 transition-colors"
                >
                  <FaFacebookF className="w-7 h-7" />
                </a>
                <a
                  href="https://www.youtube.com/@LuringInvite"
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/40 transition-colors"
                >
                  <FaYoutube className="w-7 h-7" />
                </a>
                <a
                  href="https://in.pinterest.com/luringinvite/"
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/40 transition-colors"
                  aria-label="Pinterest"
                >
                  {/* Pinterest SVG icon */}
                  <svg
                    className="w-7 h-7"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 4.991 3.657 9.128 8.438 10.093-.117-.858-.223-2.178.047-3.115.244-.832 1.573-5.308 1.573-5.308s-.4-.8-.4-1.984c0-1.859 1.078-3.247 2.419-3.247 1.142 0 1.694.858 1.694 1.887 0 1.15-.732 2.868-1.109 4.463-.316 1.338.671 2.428 1.99 2.428 2.389 0 4.021-3.066 4.021-6.697 0-2.77-1.87-4.844-5.273-4.844-3.84 0-6.24 2.872-6.24 6.08 0 1.12.331 1.911.849 2.522.238.283.272.397.186.722-.064.238-.211.812-.271 1.04-.086.33-.352.448-.648.326-1.813-.74-2.646-2.728-2.646-4.973 0-3.692 3.123-8.104 9.309-8.104 4.973 0 8.236 3.6 8.236 7.466 0 5.108-2.837 8.922-7.032 8.922-1.406 0-2.728-.76-3.182-1.617l-.865 3.29c-.25.958-.74 2.157-1.104 2.89C9.36 23.82 10.66 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/luring-invite/"
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/40 transition-colors"
                >
                  <FaLinkedin className="w-7 h-7" />
                </a>
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
                    <p className="text-white/80">+91 9121080131</p>
                    <p className="text-xs text-white/80/70">
                      Mon-Sat, 10AM-7PM
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-white/80">
                    outrightluringinvite@gmail.com
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-white/80">Hyderabad, Telangana, India</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/80/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/80">
              © {new Date().getFullYear()} Outright's Luring Invite. All rights
              reserved.
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
