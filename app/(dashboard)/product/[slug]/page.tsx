// app\(dashboard)\product\[slug]\page.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { getProductBySlug } from "@/data/products";
import { ArrowLeft, Check, Play, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import Header from "@/component/layout/header";
import Link from "next/link";
import VideoPreview, { VideoPlatform } from "@/component/shared/VideoPreview";
import PdfPreview from "@/component/shared/PdfPreview";
import { Input } from "@/component/ui/input";
import { Textarea } from "@/component/ui/textarea";
import { Button } from "@/component/ui/button";
import Footer from "@/component/layout/Footer";
import FloatingWhatsApp from "@/component/layout/FloatingWhatsApp";

const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbzAzqzG5hYLKg7oYEmWQsrIos4bLL2xUwZMPzUd5t8CURtd37mHSMld6V17XqhJmXs9/exec";
export default function ProductDetail() {
  const { slug } = useParams();
  const product = getProductBySlug(slug || "");
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    language: "English",
    notes: "",
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      productTitle: product.title,
      collectionSlug: product.collectionSlug,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      date: formData.date,
      language: formData.language,
      notes: formData.notes,
      source: "Product Detail Page",
      pageUrl: window.location.href,
    };

    try {
      await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors", // Required for Google Apps Script
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      toast({
        title: "Enquiry Sent Successfully!",
        description: "We'll get back to you shortly. Thank you!",
      });

      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        date: "",
        language: "English",
        notes: "",
      });
    } catch (err) {
      console.error("Form submission error:", err);
      toast({
        title: "Submission Failed",
        description: "Please try WhatsApp or email us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!product) return <div>Product not found</div>;

  const hasVideo = !!product.video?.url;
  const hasPdf = !!product.pdf;

  const handleWhatsAppEnquiry = () => {
    const message = encodeURIComponent(
      `Hi! I'm interested in: ${product.title}\n\nLink: ${window.location.href}`,
    );

    window.open(
      `https://api.whatsapp.com/send?phone=919121080131&text=${message}`,
      "_blank",
    );
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-8">
        <div className="container-custom section-padding">
          <Link
            href={`/collections/${product.collectionSlug}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {product.collection}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* ================= LEFT PREVIEW ================= */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-border bg-muted relative">
                {/* ✅ VIDEO */}
                {hasVideo && (
                  <>
                    <div className="absolute inset-0 pointer-events-none">
                      <VideoPreview
                        url={product.video!.url}
                        platform={product.video!.platform as VideoPlatform}
                        thumbnail={product.video!.thumbnail}
                        title={product.title}
                        mode="card"
                        interactive={false}
                        className="w-full h-full"
                        mediaClassName="w-full h-full object-cover"
                      />
                    </div>

                    <button
                      onClick={() => setVideoOpen(true)}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <span className="w-16 h-16 rounded-full bg-background/90 border flex items-center justify-center">
                        <Play className="w-7 h-7" />
                      </span>
                    </button>
                  </>
                )}

                {/* ✅ PDF */}
                {!hasVideo && hasPdf && <PdfPreview src={product.pdf!} />}

                {/* ✅ IMAGE */}
                {!hasVideo && !hasPdf && (
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </motion.div>

            {/* ================= RIGHT CONTENT ================= */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h1 className="font-heading text-3xl md:text-4xl mb-2">
                  {product.title}
                </h1>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 space-y-3">
                <h3 className="font-semibold text-lg">What's Included</h3>
                {product.whatIncluded.map((item, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Enquire Now</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />

                  {/* Optional: Language dropdown if you want to keep it */}
                  <select
                    className="w-full p-3 border rounded-md bg-background text-foreground"
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Urdu">Urdu</option>
                    <option value="Punjabi">Punjabi</option>
                  </select>

                  <Textarea
                    placeholder="Additional notes, custom requirements, or any special requests..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="min-h-[100px]"
                  />

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      type="button"
                      variant="whatsapp"
                      className="flex-1"
                      onClick={handleWhatsAppEnquiry}
                    >
                      WhatsApp Enquiry
                    </Button>

                    <Button
                      type="submit"
                      variant="cta"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Enquiry"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />

      {/* ================= VIDEO MODAL ================= */}
      <AnimatePresence>
        {videoOpen && hasVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setVideoOpen(false)}
          >
            <motion.div
              className="bg-background w-full max-w-3xl rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between p-4 border-b">
                <p className="font-semibold">{product.title}</p>
                <button onClick={() => setVideoOpen(false)}>
                  <X />
                </button>
              </div>

              <div className="aspect-video">
                <VideoPreview
                  url={product.video!.url}
                  platform={product.video!.platform as VideoPlatform}
                  title={product.title}
                  mode="modal"
                  interactive
                  className="w-full h-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
