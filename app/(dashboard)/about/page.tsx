"use client";
// import Header from "@/components/layout/Header";
// import Footer from "@/components/layout/Footer";
// import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
// import PageHero from "@/components/shared/PageHero";
import { usePublicContent } from "@/component/cms/PublicContentProvider";
import { defaults } from "@/data/cms";
import { motion } from "framer-motion";
import { Heart, Award, Users, Sparkles, Quote } from "lucide-react";
// import StatsCounter from "@/components/home/StatsCounter";
// import { WorkProcessTimeline } from "@/components/about/work-process-timeline";
// import { ProfileCard } from "@/components/ui/profile-card";
import Header from "@/component/layout/header";
import PageHero from "@/component/shared/PageHero";
import Footer from "@/component/layout/Footer";
import FloatingWhatsApp from "@/component/layout/FloatingWhatsApp";
import { ProfileCard } from "@/component/ui/profile-card";
import StatsCounter from "@/component/home/StatsCounter";
import { WorkProcessTimeline } from "@/component/about/work-process-timeline";

const values = [
  {
    icon: Heart,
    title: "Passion-Driven Craftsmanship",
    description:
      "We pour love and dedication into every detail, turning invitations into heartfelt keepsakes.",
  },
  {
    icon: Sparkles,
    title: "Innovative Elegance",
    description:
      "Blending cutting-edge AI technology with timeless design to create truly unique experiences.",
  },
  {
    icon: Users,
    title: "Personalized Collaboration",
    description:
      "Your story is at the center — we listen, understand, and bring your vision to life.",
  },
  {
    icon: Award,
    title: "Excellence Without Compromise",
    description:
      "Unwavering commitment to quality, from concept to final delivery.",
  },
];

export default function About() {
  const { about } = usePublicContent();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <PageHero
          title={about?.heading ?? defaults.about.heading}
          subtitle={about?.description ?? defaults.about.description}
          backgroundImage="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80"
        />

        {/* Elegant Intro with Butterfly Accent */}
        <section className="py-10 bg-gradient-to-b from-background to-muted/30">
          <div className="container-custom max-w-5xl px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
            >
              {about ? about.paragraphs.map((paragraph, index) => <p key={index} className="text-xl md:text-2xl text-foreground/80 leading-relaxed max-w-4xl mx-auto mb-4">{paragraph}</p>) : <p className="text-xl md:text-2xl text-foreground/80 leading-relaxed max-w-4xl mx-auto">
                At{" "}
                <span className="font-semibold text-primary">
                  Outright's Luring Invite
                </span>
                , we believe every celebration begins with an invitation that
                sets the perfect tone — one that reflects your unique story and
                leaves a lasting impression.
              </p>}
            </motion.div>
          </div>
        </section>

        <section className="py-10 bg-muted/20">
          <div className="container-custom max-w-7xl px-4">
            <ProfileCard
              name="Ms. Gurleen Kaur"
              title="Founder & Creative Director"
              imageUrl="/images/gurleen.png"
              linkedinUrl="https://www.linkedin.com/in/gurleen-kaur-bhutani-27500a123/"
            >
              {/* Description paragraphs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="space-y-5 text-muted-foreground text-base md:text-lg leading-relaxed"
              >
                <p>
                  Guided by Ms. Gurleen Kaur's visionary leadership, Outright's
                  Luring Invite has redefined digital celebrations with passion
                  and innovation.
                </p>

                <p>
                  Her deep commitment to personalized storytelling and flawless
                  execution ensures every invitation is a work of art that
                  perfectly reflects your occasion.
                </p>

                <p>
                  From AI-enhanced video invitations to bespoke designs,
                  Gurleen's creative direction continues to inspire joy and
                  connection for clients worldwide.
                </p>
              </motion.div>
            </ProfileCard>
          </div>
        </section>

        {/* Our Values - Modern Cards with Gradient Accents */}
        <section className="py-10 bg-muted/20">
          <div className="container-custom px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                Our Core Values
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The foundation of everything we create
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15, duration: 0.7 }}
                    className="group relative bg-card rounded-3xl p-8 overflow-hidden border border-transparent hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10 text-center space-y-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                        <Icon className="w-10 h-10 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold  text-foreground mb-3 group-hover:text-primary transition-colors">
                          {value.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats */}
        <StatsCounter />

        {/* Work Process */}
        <WorkProcessTimeline />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
