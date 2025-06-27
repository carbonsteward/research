"use client";

import React from "react";
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion";
import { Database, CloudRain, Thermometer, Factory, Leaf, BarChart3, CheckCircle2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ClimateDataVisualizationProps {
  className?: string;
  title?: string;
  lightColor?: string;
}

const ClimateDataVisualization = ({
  className,
  title = "Comprehensive Climate Data Coverage",
  lightColor = "#00A6F5",
}: ClimateDataVisualizationProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - left) / width);
    mouseY.set((e.clientY - top) / height);
  };
  return (
    <div
      className={cn("w-full relative overflow-hidden group", className)}
      onMouseMove={handleMouseMove}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_70%)]" />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_70%)]"
          style={{
            x: useMotionTemplate`calc(${mouseX} * 10%)`,
            y: useMotionTemplate`calc(${mouseY} * 10%)`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 lg:py-32">
        {/* Enhanced Header */}
        <motion.div
          className="flex flex-col items-center text-center mb-16 lg:mb-20 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge
            variant="outline"
            className="mb-6 px-4 py-1.5 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 backdrop-blur-sm transition-colors duration-300"
          >
            <Database className="h-4 w-4 mr-2" />
            Climate Intelligence Platform
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
            {title}
          </h2>
          <p className="text-muted-foreground/90 max-w-3xl text-lg md:text-xl leading-relaxed">
            Our platform integrates extensive databases covering all critical aspects of climate change, empowering you with unparalleled insights for your carbon mitigation projects.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative">
          {/* Left Column - Content Cards */}
          <div className="space-y-6">
            {[{
              Icon: Factory,
              title: "Transitional Risks",
              items: [
                "Policy & Regulatory Shifts",
                "Market & Consumer Behavior Changes",
                "Technological Disruptions",
                "Reputational Impacts",
              ],
              color: "blue",
              gradient: "from-blue-500 to-blue-600"
            },
            {
              Icon: Thermometer,
              title: "Physical Risks",
              items: [
                "Extreme Weather Events (Floods, Storms)",
                "Chronic Climate Changes (Sea Level Rise)",
                "Resource Scarcity & Ecosystem Impacts",
                "Supply Chain Vulnerabilities",
              ],
              color: "orange",
              gradient: "from-amber-500 to-orange-600"
            },
            {
              Icon: Leaf,
              title: "Carbon Methodologies",
              items: [
                "Gold Standard, Verra (VCS)",
                "American Carbon Registry (ACR)",
                "Climate Action Reserve (CAR)",
                "Plan Vivo, Puro.earth & more",
              ],
              color: "green",
              gradient: "from-emerald-500 to-green-600"
            },
            {
              Icon: BarChart3,
              title: "Carbon Standards & Frameworks",
              items: [
                "ISO 14064 (GHG Accounting)",
                "PAS 2060 (Carbon Neutrality)",
                "TCFD Recommendations",
                "SBTi (Science Based Targets)",
              ],
              color: "purple",
              gradient: "from-violet-500 to-purple-600"
            }].map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group/card flex flex-col gap-4 p-6 rounded-2xl bg-background/80 backdrop-blur-sm shadow-lg hover:shadow-2xl ring-1 ring-inset ring-gray-200/50 dark:ring-white/10 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-[1.02] relative overflow-hidden"
              >
                {/* Gradient accent */}
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${category.gradient}`} />

                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-full bg-${category.color}-500/10`}>
                    <category.Icon className={`h-6 w-6 text-${category.color}-500`} />
                  </div>
                  <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                    {category.title}
                  </h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2 pl-1">
                  {category.items.map((item, i) => (
                    <motion.li
                      key={item}
                      className="flex items-start gap-2 group-hover/card:translate-x-1 transition-transform duration-300"
                      style={{ transitionDelay: `${i * 50}ms` }}
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Right Column - Animated Graphic */}
          <div className="relative flex justify-center items-center min-h-[400px] lg:min-h-[600px] -mx-4 lg:mx-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "backOut" }}
              className="relative w-full max-w-md aspect-square"
            >
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={`ring-${i}`}
                  className="absolute inset-0 rounded-full border-2 border-primary/20"
                  style={{
                    borderWidth: `${(i + 1) * 1.5}px`,
                    borderColor: `hsl(var(--primary)/0.2)`
                  }}
                  animate={{
                    scale: [1, 1.05, 1, 0.95, 1],
                    opacity: [0.2, 0.4, 0.2, 0.1, 0.2],
                  }}
                  transition={{
                    duration: 10 + i * 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.5,
                  }}
                  style={{ borderWidth: `${(i + 1) * 1.5}px` }}
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 1, type: "spring", stiffness: 100, damping: 15 }}
                  className="p-8 bg-primary/10 backdrop-blur-sm rounded-full shadow-xl border border-primary/20"
                >
                  <Database className="h-24 w-24 text-primary" />
                </motion.div>
              </div>
              {[CloudRain, Shield, Leaf, Factory].map((Icon, i) => (
                <motion.div
                  key={`icon-${i}`}
                  className="absolute p-3 bg-background/90 backdrop-blur-sm rounded-xl shadow-lg border border-border z-10"
                  initial={{ opacity: 0, scale: 0.5, x: '50%', y: '50%' }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: `calc(${50 + Math.cos((i * Math.PI * 2) / 4) * 12}% - 1.5rem)`,
                    y: `calc(${50 + Math.sin((i * Math.PI * 2) / 4) * 12}% - 1.5rem)`
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.6 + i * 0.15,
                    type: "spring",
                    stiffness: 100,
                    damping: 12
                  }}
                  whileHover={{
                    scale: 1.1,
                    rotate: [0, -5, 5, -5, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  <Icon className="h-8 w-8 text-primary" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClimateDataVisualization;
