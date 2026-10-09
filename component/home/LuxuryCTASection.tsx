"use client";

import React from "react";
import { Vortex } from "@/components/ui/vortex";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function LuxuryCTASection() {
  return (
    <section className="w-full h-[300px] rounded-3xl overflow-hidden">
      <Vortex
        backgroundColor="#12071d"
        baseHue={280}
        particleCount={600}
        rangeY={500}
        className="flex flex-col items-center justify-center text-center px-6 py-10"
      >
        {/* <Sparkles className="text-purple-300 mb-4" size={34} /> */}

        <h2 className="text-white text-3xl md:text-6xl font-bold">
          Ready to Create Your
          <span className="italic text-purple-300"> Dream Invitation?</span>
        </h2>

        <p className="text-purple-100 mt-4 max-w-2xl text-lg">
          Let us transform your love story into a luxury digital experience your
          guests will remember forever.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link to="/contact">
            <button className="px-8 py-3 bg-purple-500 hover:bg-purple-600 rounded-full text-white flex items-center gap-2 shadow-xl transition">
              Start Invitation <ArrowRight size={18} />
            </button>
          </Link>

          <Link to="/contact">
            <button className="px-8 py-3 border border-purple-300 text-purple-200 rounded-full hover:bg-white/10 transition">
              Talk to Designer
            </button>
          </Link>
        </div>
      </Vortex>
    </section>
  );
}