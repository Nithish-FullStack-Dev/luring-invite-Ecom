"use client";

import "./InviteCard.css";

const InviteCard = () => {
  return (
    <div className="w-full h-full bg-white rounded-lg border border-border/30 overflow-hidden flex flex-col md:flex-row">
      {/* IMAGE SECTION */}
      <div className="w-full h-[160px] md:h-full md:w-[35%] shrink-0 flex items-center justify-center relative bg-gray-50">
        {/* Desktop portrait frame */}
        <div className="hidden md:flex items-center justify-center w-full h-full">
          <div className="relative w-[260px] h-[360px] rounded-[180px] bg-[#F6E8DD] flex items-center justify-center shadow-lg">
            {/* border ring */}
            <div className="absolute inset-0 rounded-[180px] border-[6px] border-primary" />

            <img
              src="/images/gurleen.png"
              alt="Gurleen Kaur"
              className="w-[230px] h-[330px] object-cover rounded-[160px]"
            />
          </div>
        </div>

        {/* Mobile image (unchanged) */}
        <div className="md:hidden w-full h-full flex items-center justify-center">
          <img
            src="/images/gurleen.png"
            alt="Gurleen Kaur"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* 2. CONTENT SECTION
        - Flex column layout
        - min-h-0 is CRITICAL for nested scrolling to work
      */}
      <div className="w-full md:w-[65%] p-4 md:p-10 flex flex-col h-full min-h-0">
        {/* SCROLLABLE AREA
          - flex-1: Takes all remaining space
          - overflow-y-auto: Enables scroll
          - Custom scrollbar styling added
        */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar-primary">
          <h3 className="font-display text-xl md:text-3xl text-primary mb-3 md:mb-6 font-bold">
            Know Us Well!
          </h3>

          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            Welcome to Outright's Luring Invite, where dreams meet innovation,
            and every occasion becomes a cherished memory. Founded under the
            visionary leadership of our Director, Ms. Gurleen Kaur, Outright's
            Luring Invite is more than just a digital invitation service — it’s
            a reflection of passion, creativity, and a commitment to making your
            special moments truly unforgettable.
            <br />
            <br />
            Driven by Gurleen’s personal dedication to infuse every event with
            warmth and a personalized touch, Outright's Luring Invite embodies a
            mission to redefine the art of celebration. With a keen eye for
            detail and a heart full of creativity, each client’s vision is
            transformed into captivating digital invitations that resonate with
            authenticity and charm.
            <br />
            <br />
            {/* Added extra text to demonstrate scrolling if needed */}
            We believe that every invitation tells a story, and we are here to
            help you write yours.
          </p>
        </div>

        {/* FOOTER (Always Visible) */}
        <div className="shrink-0 border-t border-border/40 pt-3 md:pt-6 mt-3 md:mt-4 bg-white">
          <h2 className="font-display text-lg md:text-3xl text-primary font-bold">
            Gurleen Kaur
          </h2>
          <p className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground mt-1">
            Founder & Director
          </p>
        </div>
      </div>
    </div>
  );
};

export default InviteCard;
