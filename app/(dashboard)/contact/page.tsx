"use client";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Header from "../layout/header";
import PageHero from "@/component/shared/PageHero";
import Footer from "../layout/Footer";
import FloatingWhatsApp from "../layout/FloatingWhatsApp";
import { Input } from "@/component/ui/input";
import { Textarea } from "@/component/ui/textarea";
import { Button } from "@/component/ui/button";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    value: "+91 9121080131",
    link: "tel:+919121080131",
  },
  {
    icon: Mail,
    title: "Email",
    value: "outrightluringinvite@gmail.com",
    link: "mailto:outrightluringinvite@gmail.com",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Hyderabad, Telangana, India",
    link: null,
  },
  {
    icon: Clock,
    title: "Working Hours",
    value: "Mon - Sat: 10AM - 7PM",
    link: null,
  },
];
const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbzAzqzG5hYLKg7oYEmWQsrIos4bLL2xUwZMPzUd5t8CURtd37mHSMld6V17XqhJmXs9/exec";
export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   toast({
  //     title: "Message Sent!",
  //     description: "We will get back to you within 24 hours.",
  //   });
  //   setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  // };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
      source: "Contact Page",
      pageUrl: window.location.href,
    };

    try {
      await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      toast({
        title: "Message Sent!",
        description: "Thank you — we'll reply within 24 hours.",
      });

      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast({
        title: "Error Sending Message",
        description: "Please try WhatsApp or email directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleWhatsApp = () => {
    const message = `Hi! I'm ${formData.name || "interested"}.\nSubject: ${formData.subject || "General Enquiry"}\nMessage: ${formData.message || "I would like to enquire about your services."}`;
    window.open(
      `https://wa.me/919121080131?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <PageHero
          title="Contact Us"
          subtitle="Get in touch for enquiries, collaborations, or questions"
          backgroundImage="https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1920&q=80"
        />

        <section className="section-padding">
          <div className="container-custom px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              {/* Contact Info Cards */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-6">
                  Get in Touch
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {contactInfo.map((info, index) => {
                    const IconComponent = info.icon;
                    const content = (
                      <div className="flex items-start gap-4 p-4 md:p-5 bg-card border border-border rounded-xl hover:border-primary transition-colors h-full">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm md:text-base mb-1">
                            {info.title}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {info.value}
                          </p>
                        </div>
                      </div>
                    );

                    return (
                      <motion.div
                        key={info.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {info.link ? (
                          <a href={info.link} className="block h-full">
                            {content}
                          </a>
                        ) : (
                          content
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* WhatsApp CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6"
                >
                  <button
                    onClick={handleWhatsApp}
                    className="w-full flex items-center justify-center gap-3 p-4 md:p-5 bg-[#25D366] hover:bg-[#22c55e] text-white rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="font-semibold text-base md:text-lg">
                      Chat on WhatsApp
                    </span>
                  </button>
                </motion.div>
              </motion.div>

              <motion.form
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleSubmit}
                className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4"
              >
                <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-4">
                  Send a Message
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                </div>

                <Textarea
                  placeholder="Your Message"
                  className="min-h-[120px] md:min-h-[150px]"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                />

                <Button
                  type="submit"
                  variant="cta"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </motion.form>
            </div>
          </div>
        </section>
        {/* Map Section */}
        <section className="pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.2925253551093!2d78.37706367462825!3d17.445707601123505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb918eba467a47%3A0xa28b265953b650b4!2sOutright%20Creators!5e0!3m2!1sen!2sin!4v1750748293049!5m2!1sen!2sin"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Our Location"
              ></iframe>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
