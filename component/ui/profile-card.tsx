"use client";

import { motion } from "framer-motion";
import { FaGithub, FaYoutube, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface ProfileCardProps {
  name?: string;
  title?: string;
  imageUrl?: string;
  instgramUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ProfileCard({
  name = "Ms. Gurleen Kaur",
  title = "Founder & Creative Director",
  imageUrl = "/images/gurleen.png",
  instgramUrl = "https://www.instagram.com/mrs.outright/",
  linkedinUrl = "https://www.linkedin.com/in/gurleen-kaur-bhutani-27500a123/",
  youtubeUrl = "https://www.youtube.com/@LuringInvite",
  className,
  children,
}: ProfileCardProps) {
  const socials = [
    { icon: FaGithub, url: "https://github.com/", label: "GitHub" },
    { icon: FaXTwitter, url: "https://x.com/", label: "Twitter / X" },
    { icon: FaYoutube, url: youtubeUrl, label: "YouTube" },
    { icon: FaLinkedinIn, url: linkedinUrl, label: "LinkedIn" },
    { icon: FaInstagram, url: instgramUrl, label: "Instagram" },
  ];

  return (
    <div className={cn("w-full max-w-7xl mx-auto", className)}>
      <div className="grid lg:grid-cols-2 items-center gap-12 lg:gap-0">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex justify-center"
        >
          <div className="relative w-80 h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-8 border-primary/20 shadow-2xl">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold">
              <span className="font-cursive text-primary">{name}</span>
            </h2>
            <p className="text-xl font-medium text-muted-foreground mt-2">
              {title}
            </p>
          </div>

          {/* 👇 injected content */}
          {children}

          <div className="flex flex-wrap gap-4 pt-4">
            {socials.map(({ icon: Icon, url, label }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:scale-110"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
