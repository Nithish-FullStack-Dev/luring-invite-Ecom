"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";
import { motion } from "framer-motion";

interface VortexProps {
  children?: any;
  className?: string;
  containerClassName?: string;
  particleCount?: number;
  rangeY?: number;
  baseHue?: number;
  baseSpeed?: number;
  rangeSpeed?: number;
  baseRadius?: number;
  rangeRadius?: number;
  backgroundColor?: string;
}

export const Vortex = (props: VortexProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const particleCount = props.particleCount || 700;
  const particlePropCount = 9;
  const particlePropsLength = particleCount * particlePropCount;

  const rangeY = props.rangeY || 100;
  const baseTTL = 50;
  const rangeTTL = 150;

  const baseSpeed = props.baseSpeed || 0;
  const rangeSpeed = props.rangeSpeed || 1.5;

  const baseRadius = props.baseRadius || 1;
  const rangeRadius = props.rangeRadius || 2;

  const baseHue = props.baseHue || 280; // luxury purple
  const rangeHue = 60;

  const noise3D = createNoise3D();

  const xOff = 0.00125;
  const yOff = 0.00125;
  const zOff = 0.0005;

  const backgroundColor = props.backgroundColor || "#0b0512";

  let tick = 0;
  let particleProps = new Float32Array(particlePropsLength);
  let center: [number, number] = [0, 0];

  const TAU = Math.PI * 2;

  const rand = (n: number) => n * Math.random();
  const randRange = (n: number) => n - rand(2 * n);

  const fadeInOut = (t: number, m: number) => {
    const hm = 0.5 * m;
    return Math.abs(((t + hm) % m) - hm) / hm;
  };

  const lerp = (a: number, b: number, t: number) =>
    (1 - t) * a + t * b;

  const initParticle = (i: number, canvas: HTMLCanvasElement) => {
    const x = rand(canvas.width);
    const y = center[1] + randRange(rangeY);

    particleProps.set(
      [
        x,
        y,
        0,
        0,
        0,
        baseTTL + rand(rangeTTL),
        baseSpeed + rand(rangeSpeed),
        baseRadius + rand(rangeRadius),
        baseHue + rand(rangeHue),
      ],
      i
    );
  };

  const resize = (canvas: HTMLCanvasElement) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    center = [canvas.width / 2, canvas.height / 2];
  };

  const drawParticle = (
    x:number,
    y:number,
    x2:number,
    y2:number,
    life:number,
    ttl:number,
    radius:number,
    hue:number,
    ctx:CanvasRenderingContext2D
  ) => {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineWidth = radius;
    ctx.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life,ttl)})`;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x2,y2);
    ctx.stroke();
    ctx.restore();
  };

  const draw = (canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D) => {
    tick++;

    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    for (let i=0;i<particlePropsLength;i+=particlePropCount){
      let x = particleProps[i];
      let y = particleProps[i+1];

      const n =
        noise3D(x*xOff,y*yOff,tick*zOff) * TAU;

      const vx = lerp(particleProps[i+2],Math.cos(n),0.5);
      const vy = lerp(particleProps[i+3],Math.sin(n),0.5);

      const life = particleProps[i+4];
      const ttl = particleProps[i+5];
      const speed = particleProps[i+6];
      const radius = particleProps[i+7];
      const hue = particleProps[i+8];

      const x2 = x + vx*speed;
      const y2 = y + vy*speed;

      drawParticle(x,y,x2,y2,life,ttl,radius,hue,ctx);

      particleProps[i]=x2;
      particleProps[i+1]=y2;
      particleProps[i+2]=vx;
      particleProps[i+3]=vy;
      particleProps[i+4]=life+1;

      if (
        x2 <0 || x2>canvas.width ||
        y2 <0 || y2>canvas.height ||
        life>ttl
      ){
        initParticle(i,canvas);
      }
    }

    requestAnimationFrame(()=>draw(canvas,ctx));
  };

  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;

    const ctx = canvas.getContext("2d");
    if(!ctx) return;

    resize(canvas);

    for(let i=0;i<particlePropsLength;i+=particlePropCount){
      initParticle(i,canvas);
    }

    draw(canvas,ctx);

    window.addEventListener("resize",()=>resize(canvas));
  },[]);

  return (
    <div className={cn("relative h-full w-full", props.containerClassName)}>
      <motion.div
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        ref={containerRef}
        className="absolute inset-0 z-0"
      >
        <canvas ref={canvasRef}/>
      </motion.div>

      <div className={cn("relative z-10", props.className)}>
        {props.children}
      </div>
    </div>
  );
};