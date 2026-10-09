import { motion } from 'framer-motion';
import { useState } from 'react';
import { processSteps } from '@/data/products';
import { Palette, PenTool, Layers, Play, RefreshCw, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const iconMap: Record<string, React.ElementType> = {
  Palette,
  PenTool,
  Layers,
  Play,
  RefreshCw,
  CheckCircle,
};

export default function ProcessSection() {
  const [selectedStep, setSelectedStep] = useState<typeof processSteps[0] | null>(null);

  return (
    <section className="section-padding bg-background overflow-hidden">
      <div className="container-custom px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            Our Creative Process
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            From concept to delivery, we follow a meticulous process to ensure your invitation is perfect.
          </p>
        </motion.div>

        {/* Process Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {processSteps.map((step, index) => {
            const IconComponent = iconMap[step.icon];
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <button
                  onClick={() => setSelectedStep(step)}
                  className="w-full text-left group relative"
                >
                  <div className="relative bg-card border border-border rounded-2xl p-6 md:p-8 h-full transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10 glow-border">
                    {/* Step number badge */}
                    <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg">
                      {step.id}
                    </div>

                    {/* Icon with animated background */}
                    <div className="relative w-16 h-16 md:w-20 md:h-20 mb-6">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        {IconComponent && <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-primary" />}
                      </div>
                      {/* Animated ring on hover */}
                      <div className="absolute inset-0 rounded-2xl border-2 border-primary/0 group-hover:border-primary/50 transition-colors" />
                    </div>

                    {/* Content */}
                    <h3 className="font-semibold text-lg md:text-xl text-foreground mb-3 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm md:text-base mb-4 line-clamp-2">
                      {step.description}
                    </p>

                    {/* Turnaround badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-xs md:text-sm text-primary font-medium">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      {step.turnaround}
                    </div>

                    {/* Connection line (desktop only) */}
                    {index < processSteps.length - 1 && index % 3 !== 2 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Modal */}
        <Dialog open={!!selectedStep} onOpenChange={() => setSelectedStep(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl flex items-center gap-3">
                {selectedStep && iconMap[selectedStep.icon] && (
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {(() => {
                      const Icon = iconMap[selectedStep.icon];
                      return <Icon className="w-5 h-5 text-primary" />;
                    })()}
                  </div>
                )}
                <span>{selectedStep?.title}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {selectedStep?.description}
              </p>
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-3 rounded-lg">
                <span className="font-semibold">Typical Turnaround:</span>
                <span>{selectedStep?.turnaround}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
