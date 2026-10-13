// src/components/layout/Header.tsx
"use client";
import { usePublicContent } from "@/component/cms/PublicContentProvider";
import { defaults } from "@/data/cms";
import React, { useEffect, useRef, useState } from "react";
import { Menu, X, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLoader } from "@/lib/loader-context";

const topMessages: string[] = [
  "Customizable magnets tailored to your occasion",
  "Premium designs crafted for every celebration",
  "Special pricing available for bulk orders",
  "High-quality prints with lasting finish",
  "Dedicated customer support available 24/7",
];

const WHATSAPP_NUMBER = "919121080131";
const WHATSAPP_LINK = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}`;

const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/outrightluring",
  instagram: "https://www.instagram.com/outrightsluringinvite/",
  pinterest: "https://in.pinterest.com/luringinvite/",
  youtube: "https://www.youtube.com/channel/UCNM3O5018f7nqLKFn3UIH8w",
  linkedin: "https://in.linkedin.com/in/luring-invite-94a35928b",
  email: "mailto:outrightluringinvite@gmail.com",
  whatsapp: WHATSAPP_LINK,
};
const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbzAzqzG5hYLKg7oYEmWQsrIos4bLL2xUwZMPzUd5t8CURtd37mHSMld6V17XqhJmXs9/exec";

const Header: React.FC = () => {
  const cms = usePublicContent();
  const contact = cms.contact ?? defaults.contact;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null); // ✅ NEW

  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteData, setQuoteData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const navItems = (cms.navigation ?? defaults.navigation).links;
  const submitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingQuote(true);

    const payload = {
      productTitle: "Quote Request",
      collectionSlug: quoteData.service,
      name: quoteData.name,
      phone: quoteData.phone,
      email: quoteData.email,
      notes: quoteData.message,
      source: "Header Quote Form",
      pageUrl: window.location.href,
    };

    try {
      await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      setQuoteData({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: "",
      });

      setIsQuoteOpen(false);
    } finally {
      setIsSubmittingQuote(false);
    }
  };
  // Text carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % topMessages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // ✅ FIXED: Close menu ONLY when clicking outside Mobile Menu + Desktop Nav
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isMobileMenuOpen) return;

      const target = event.target as Node;

      const clickedInsideDesktopNav =
        dropdownRef.current && dropdownRef.current.contains(target);

      const clickedInsideMobileMenu =
        mobileMenuRef.current && mobileMenuRef.current.contains(target);

      if (clickedInsideDesktopNav || clickedInsideMobileMenu) return;

      setIsMobileMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  const { done } = useLoader();

  // ✅ Open Quote Modal (works on mobile now)
  const openQuote = () => {
    setIsMobileMenuOpen(false);
    // small delay ensures menu unmount doesn't block modal on some mobiles
    setTimeout(() => setIsQuoteOpen(true), 0);
  };

  return (
    <>
      {/* ✅ STICKY WRAPPER */}
      <div className="sticky top-0 z-50 w-full">
        {/* ================= TOP BAR ================= */}
        <div className="bg-[#a86dcd] text-white text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto px-3 py-2 grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_auto] items-center gap-3">
            {/* Left: Phone + Email (ICONS ONLY ON MOBILE) */}
            <div className="flex items-center gap-3">
              <a
                href={"tel:" + contact.phone.replace(/[^+0-9]/g, "")}
                className="inline-flex items-center gap-2 font-semibold"
                aria-label="Call"
              >
                <Phone className="w-5 h-5" />
                <span className="hidden sm:inline underline whitespace-nowrap">
                  {contact.phone}
                </span>
              </a>

              <a
                href={"mailto:" + contact.email}
                className="inline-flex items-center gap-2 font-semibold"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
                <span className="hidden sm:inline underline whitespace-nowrap">
                  {contact.email}
                </span>
              </a>
            </div>

            {/* Center: Slider */}
            <div className="relative h-5 overflow-hidden justify-self-center text-center w-[300px] sm:w-[360px] md:w-[520px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{
                    x: "0%",
                    opacity: 1,
                    transition: {
                      x: { duration: 0.6, ease: "easeInOut" },
                      opacity: { duration: 0.3 },
                    },
                  }}
                  exit={{
                    x: "-100%",
                    opacity: 0,
                    transition: {
                      x: { duration: 0.6, ease: "easeIn" },
                      opacity: { duration: 0.3 },
                    },
                  }}
                  className="absolute inset-0 flex items-center justify-center font-medium whitespace-nowrap"
                >
                  {topMessages[activeIndex]}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: Social icons (Desktop Only) */}
            <div className="hidden md:flex items-center gap-4 justify-self-end">
              <a
                href={"https://wa.me/" + contact.whatsapp}
                target="_blank"
                rel="noreferrer"
              >
                <i className="fab fa-whatsapp text-lg" />
              </a>
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noreferrer">
                <i className="fab fa-facebook-f text-lg" />
              </a>
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer">
                <i className="fab fa-instagram text-lg" />
              </a>
              <a href={SOCIAL_LINKS.pinterest} target="_blank" rel="noreferrer">
                <i className="fab fa-pinterest-p text-lg" />
              </a>
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer">
                <i className="fab fa-youtube text-lg" />
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer">
                <i className="fab fa-linkedin-in text-lg" />
              </a>
            </div>
          </div>
        </div>

        {/* ================= HEADER ================= */}
        <header className="bg-white shadow-md font-ysabeau">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between py-2">
              {/* Logo */}
              <Link href="/" className="relative h-20 flex items-center">
                <motion.img
                  // layoutId="site-logo"
                  src="https://res.cloudinary.com/drdotym31/image/upload/v1750078130/main-logo-1-1024x795_lfasd5.webp"
                  alt="Logo"
                  className="h-16 sm:h-20 w-auto object-contain"
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </Link>

              {/* Desktop Nav */}
              <nav
                ref={dropdownRef}
                className="hidden lg:flex items-center gap-8"
              >
                {navItems.map(({ label, url }) => (
                  <Link
                    key={url + label}
                    href={url}
                    className="font-semibold hover:text-[#A86DCD]"
                  >
                    {label}
                  </Link>
                ))}

                {/* ✅ Quote Button */}
                <button
                  onClick={openQuote}
                  className="bg-[#A86DCD] text-white px-5 py-2 rounded-full font-semibold hover:opacity-90 transition"
                >
                  Get a Quote
                </button>
              </nav>

              {/* ✅ Mobile Toggle (Menu <-> Close) */}
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="lg:hidden p-2"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-7 h-7" />
                ) : (
                  <Menu className="w-7 h-7" />
                )}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white overflow-y-auto">
          <div ref={mobileMenuRef} className="p-4">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-bold">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <nav className="space-y-5">
              {navItems.map(({ label, url }) => (
                <Link
                  key={url + label}
                  href={url}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-lg font-medium"
                >
                  {label}
                </Link>
              ))}

              {/* ✅ Quote Button Mobile */}
              <button
                onClick={openQuote}
                className="w-full bg-[#A86DCD] text-white py-3 rounded-xl font-semibold mt-4"
              >
                Get a Quote
              </button>
            </nav>

            {/* ✅ Mobile Footer Links */}
            <div className="mt-10 border-t pt-6">
              <div className="flex items-center justify-center gap-5 text-gray-700">
                <a
                  href={"https://wa.me/" + contact.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                >
                  <i className="fab fa-whatsapp text-2xl text-green-500" />
                </a>
                <a href={"mailto:" + contact.email} aria-label="Email">
                  <Mail className="w-6 h-6" />
                </a>
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <i className="fab fa-instagram text-2xl" />
                </a>
                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                >
                  <i className="fab fa-facebook-f text-2xl" />
                </a>
                <a
                  href={SOCIAL_LINKS.pinterest}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Pinterest"
                >
                  <i className="fab fa-pinterest-p text-2xl" />
                </a>
                <a
                  href={SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                >
                  <i className="fab fa-youtube text-2xl" />
                </a>
                <a
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                >
                  <i className="fab fa-linkedin-in text-2xl" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= GET A QUOTE MODAL ================= */}
      <AnimatePresence>
        {isQuoteOpen && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsQuoteOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-5 sm:p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute right-4 top-4"
                onClick={() => setIsQuoteOpen(false)}
                aria-label="Close quote form"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-xl sm:text-2xl font-bold text-[#A86DCD] mb-1">
                Get a Quote
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Fill the details and we’ll contact you shortly.
              </p>

              <form onSubmit={submitQuote} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="Name"
                    value={quoteData.name}
                    onChange={(e) =>
                      setQuoteData({ ...quoteData, name: e.target.value })
                    }
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#A86DCD]"
                  />

                  <input
                    required
                    type="email"
                    placeholder="Email"
                    value={quoteData.email}
                    onChange={(e) =>
                      setQuoteData({ ...quoteData, email: e.target.value })
                    }
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#A86DCD]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    type="tel"
                    placeholder="Phone"
                    value={quoteData.phone}
                    onChange={(e) =>
                      setQuoteData({ ...quoteData, phone: e.target.value })
                    }
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#A86DCD]"
                  />

                  <select
                    required
                    value={quoteData.service}
                    onChange={(e) =>
                      setQuoteData({ ...quoteData, service: e.target.value })
                    }
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#A86DCD]"
                  >
                    <option value="">Which service?</option>
                    <option value="Wedding Invites">Wedding Invites</option>
                    <option value="Birthday Invites">Birthday Invites</option>
                    <option value="Anniversary Invites">
                      Anniversary Invites
                    </option>
                    <option value="Housewarming Invites">
                      Housewarming Invites
                    </option>
                    <option value="Custom Magnet">Custom Magnet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <textarea
                  required
                  rows={4}
                  placeholder="Message"
                  value={quoteData.message}
                  onChange={(e) =>
                    setQuoteData({ ...quoteData, message: e.target.value })
                  }
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#A86DCD]"
                />

                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="w-full bg-[#A86DCD] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  {isSubmittingQuote ? "Submitting..." : "Submit"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
