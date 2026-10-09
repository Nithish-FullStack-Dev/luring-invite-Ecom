"use client";
// import { Timeline } from "@/components/ui/timeline";
import { workProcess } from "@/data/workProcess";
import {
  MessageCircle,
  Lightbulb,
  FileText,
  LayoutTemplate,
  Video,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";
import { Timeline } from "../ui/timeline";

export function WorkProcessTimeline() {
  const icons = [
    <MessageCircle className="h-5 w-5" />,
    <Lightbulb className="h-5 w-5" />,
    <FileText className="h-5 w-5" />,
    <LayoutTemplate className="h-5 w-5" />,
    <Video className="h-5 w-5" />,
    <RefreshCcw className="h-5 w-5" />,
    <CheckCircle2 className="h-5 w-5" />,
  ];

  const timelineData = workProcess.map((item, index) => ({
    title: item.title,
    icon: icons[index] ?? <CheckCircle2 className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          {item.description}
        </p>

        {/* <img
          src={item.image}
          alt={item.title}
          className="w-full h-48 md:h-64 object-cover rounded-2xl border border-border"
          loading="lazy"
        /> */}
      </div>
    ),
  }));

  return (
    <Timeline
      data={timelineData}
      heading="Work Process Timeline"
      subheading="See how we take your invitation from idea to final delivery."
    />
  );
}
