"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";

import Header from "@/component/layout/header";
import Footer from "@/component/layout/Footer";
import FloatingWhatsApp from "@/component/layout/FloatingWhatsApp";
import { Button } from "@/component/ui/button";
import { getCollectionBySlug } from "@/data/products";

const collectionDefinitions = [
  {
    slug: "wedding",
    title: "Wedding Invitations",
    description:
      "Elegant invitations for your wedding celebrations, designed to make your special day unforgettable.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85",
  },
  {
    slug: "birthday",
    title: "Birthday Invitations",
    description:
      "Celebrate another beautiful year with creative, personalized birthday invitation designs.",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=85",
  },
  {
    slug: "anniversary",
    title: "Anniversary Invitations",
    description:
      "Celebrate love and togetherness with elegant invitations for your anniversary.",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85",
  },
  {
    slug: "baby-shower",
    title: "Baby Shower Invitations",
    description:
      "Welcome a little miracle with sweet, beautiful invitations for your baby shower.",
    image:
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=85",
  },
  {
    slug: "engagement",
    title: "Engagement Invitations",
    description:
      "Announce the beginning of forever with a design that feels uniquely yours.",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=85",
  },
  {
    slug: "housewarming",
    title: "Housewarming Invitations",
    description:
      "Invite family and friends to celebrate your new home and fresh beginnings.",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85",
  },
];

export default function CollectionsPage() {
  const collections = collectionDefinitions
    .map((definition) => {
      const collection = getCollectionBySlug(definition.slug);

      if (!collection) return null;

      return {
        ...definition,
        title: collection.title,
        description: collection.description,
        image: collection.thumbnail || definition.image,
      };
    })
    .filter((collection) => collection !== null);

  return (
    <div className="min-h-screen overflow-hidden bg-[#fdfbfe] text-[#302438]">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-[#f0e5f6] bg-gradient-to-b from-[#f8effd] via-[#fdf9ff] to-[#fdfbfe]">
          <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#e9d2f8]/60 blur-[100px]" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-[#f0dffa]/60 blur-[100px]" />

          <div className="relative mx-auto max-w-[1440px] px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e8d5f4] bg-white/80 px-4 py-2 text-[10px] font-semibold tracking-[0.16em] text-[#9059b2] shadow-sm sm:text-xs">
              <Sparkles size={14} />
              MADE FOR YOUR SPECIAL MOMENTS
            </span>

            <h1 className="mx-auto mt-6 max-w-4xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Invitations for Every
              <span className="mt-2 block font-normal italic text-[#a86dcd]">
                Beautiful Occasion
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#8b8093] sm:text-base sm:leading-8">
              From weddings and birthdays to life&apos;s most meaningful
              milestones, discover a collection of invitations made to feel
              personal, memorable, and uniquely yours.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/">
                <Button
                  variant="outline"
                  className="min-h-12 rounded-xl border-[#e4d3ef] bg-white px-6 text-[#80519b] hover:bg-[#f8f0fc]"
                >
                  Explore Homepage
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a477bf]">
                Find your perfect style
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Explore Collections
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#8b8093]">
                Choose an occasion to discover designs made just for you.
              </p>
            </div>

            <span className="text-xs text-[#94869e]">
              {collections.length} collections
            </span>
          </div>

          {collections.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {collections.map((collection, index) => (
                <Link
                  key={collection.slug}
                  href={`/collections/${collection.slug}`}
                  className="group overflow-hidden rounded-2xl border border-[#eee5f3] bg-white shadow-[0_4px_18px_rgba(65,36,79,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d8b9e9] hover:shadow-[0_16px_36px_rgba(91,46,119,0.12)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#f7f1fa]">
                    <img
                      src={collection.image}
                      alt={collection.title}
                      loading={index < 3 ? "eager" : "lazy"}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#25152f]/65 via-[#25152f]/10 to-transparent" />

                    <span className="absolute bottom-4 left-4 right-4 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                      {collection.title}
                    </span>

                    <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/90 text-[#9259b7] shadow-sm transition-transform duration-300 group-hover:rotate-45">
                      <ArrowUpRight size={19} />
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">
                    <p className="line-clamp-3 min-h-[60px] text-sm leading-6 text-[#8b8093]">
                      {collection.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-[#f0eaf4] pt-4">
                      <span className="text-sm font-semibold text-[#80519b]">
                        Explore Designs
                      </span>

                      <ArrowRight
                        size={17}
                        className="text-[#a86dcd] transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#e4d6ed] bg-white px-6 py-14 text-center">
              <Sparkles size={30} className="mx-auto text-[#a86dcd]" />

              <h3 className="mt-4 text-lg font-semibold">
                Collections coming soon
              </h3>

              <p className="mt-2 text-sm text-[#8b8093]">
                Add your collections to the product data to display them here.
              </p>

              <Link
                href="/"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#9259b7]"
              >
                Back to homepage
                <ArrowRight size={15} />
              </Link>
            </div>
          )}

          <div className="mt-12 rounded-3xl border border-[#eadcf3] bg-gradient-to-r from-[#faf3ff] via-white to-[#f8effd] px-5 py-9 text-center sm:mt-16 sm:px-10 sm:py-12">
            <Sparkles size={26} className="mx-auto text-[#a86dcd]" />

            <h2 className="mt-4 text-xl font-semibold sm:text-2xl">
              Make your invitation truly yours
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#8b8093]">
              Found a style you love? Explore our invitation designs and
              personalize the details for your special celebration.
            </p>

            <Link
              href="/templates"
              className="group mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#a86dcd] to-[#9254b7] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(168,109,205,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(168,109,205,0.3)]"
            >
              Browse All Templates
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
