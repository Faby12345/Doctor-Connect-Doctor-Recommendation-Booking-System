"use client";

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from "motion/react";
import React, { Children, cloneElement, useEffect, useRef, useState } from "react";

export type DockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
};

const NOISE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='120' height='120' filter='url(%23n)' opacity='.18'/></svg>";

/* ================= DockItem ================= */

function DockItem({
  children,
  className = "",
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect =
      ref.current?.getBoundingClientRect() ?? { x: 0, width: baseItemSize };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  const blueBoost = useSpring(isHovered, {
    stiffness: 240,
    damping: 20,
    mass: 0.4,
  });
  const blueOpacity = useTransform(blueBoost, [0, 1], [0.55, 0.92]);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size,
        // ✅ Safari fix: forțează clipping corect pt border-radius + blend/filters
        WebkitMaskImage: "-webkit-radial-gradient(white, black)",
        maskImage: "radial-gradient(white, black)",
        transform: "translateZ(0)",
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      tabIndex={0}
      role="button"
      className={[
        "group relative inline-flex items-center justify-center overflow-hidden rounded-2xl",
        "cursor-pointer",
        "bg-[radial-gradient(140%_120%_at_50%_0%,rgba(235,245,255,.24),transparent_60%),linear-gradient(180deg,rgba(195,225,255,.90),rgba(120,185,255,.90)),rgba(255,255,255,.06)]",
        "border-0",
        "shadow-[0_10px_22px_rgba(2,6,23,.25),inset_0_1px_0_rgba(255,255,255,.45)]",
        "backdrop-blur-[14px] backdrop-saturate-150",
        "transition-[box-shadow] duration-150 ease-out",
        "hover:shadow-[0_16px_34px_rgba(2,6,23,.34),inset_0_1px_0_rgba(255,255,255,.60)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60",
        className,
      ].join(" ")}
    >
      {/* overlay “normal” */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          opacity: 0.75,
          background:
            "radial-gradient(120% 120% at 50% 0%, rgba(215,235,255,.55), rgba(155,205,255,.34) 55%, rgba(105,165,245,.24))",
        }}
      />

      {/* overlay extra */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          opacity: blueOpacity,
          background:
            "radial-gradient(120% 120% at 50% 0%, rgba(160,205,255,.55), rgba(95,165,255,.40) 55%, rgba(55,130,245,.30))",
        }}
      />

      {/* sheen */}
      <span
        aria-hidden
        className={[
          "pointer-events-none absolute -inset-px rounded-2xl mix-blend-screen will-change-transform",
          "bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,.55)_35%,transparent_55%)]",
          "-translate-x-[60%] opacity-0",
          "group-hover:translate-x-0 group-hover:opacity-100",
          "transition-[transform,opacity]",
          "duration-[1300ms] ease-in-out",
          "group-hover:duration-[600ms] group-hover:ease-in-out",
        ].join(" ")}
      />

      {Children.map(children, (child) =>
        React.isValidElement(child)
          ? cloneElement(
              child as React.ReactElement<{ isHovered?: MotionValue<number> }>,
              { isHovered }
            )
          : child
      )}
    </motion.div>
  );
}

/* ================= DockLabel ================= */

function DockLabel({
  children,
  isHovered,
}: {
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    return isHovered.on("change", (v) => setVisible(v === 1));
  }, [isHovered]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          className="absolute left-1/2 bottom-[calc(100%+10px)] -translate-x-1/2 rounded-lg border border-white/55 bg-white/85 px-2.5 py-1 text-[0.78rem] font-semibold text-[#0b1020] shadow-lg backdrop-blur-md"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================= DockIcon ================= */

function DockIcon({
  children,
  isHovered,
}: {
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
}) {
  const hover = useSpring(isHovered ?? useMotionValue(0), {
    stiffness: 260,
    damping: 18,
    mass: 0.35,
  });

  const scale = useTransform(hover, [0, 1], [1, 1.22]);
  const y = useTransform(hover, [0, 1], [0, -2]);
  const shadow = useTransform(hover, [0, 1], [
    "drop-shadow(0 0 0 rgba(0,0,0,0))",
    "drop-shadow(0 8px 14px rgba(0,0,0,.25))",
  ]);

  return (
    <div className="grid place-items-center overflow-visible">
      <motion.div style={{ scale, y, filter: shadow }}>
        {children}
      </motion.div>
    </div>
  );
}

/* ================= Dock ================= */

export default function Dock({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 68,
  baseItemSize = 50,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="pointer-events-none fixed left-1/2 bottom-[14px] z-[1000] -translate-x-1/2">
      <motion.div
        onMouseMove={({ clientX }) => mouseX.set(clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        style={{ height: panelHeight }}
        className={[
          "pointer-events-auto relative isolate flex items-end gap-[0.85rem]",
          "rounded-[20px] px-[0.65rem] py-[0.6rem]",
          "border border-white/45",
          "shadow-[0_22px_40px_rgba(2,6,23,.30),0_8px_20px_rgba(2,6,23,.18)]",
          "backdrop-blur-[18px] backdrop-saturate-125",
          "bg-[radial-gradient(140%_100%_at_10%_0%,rgba(96,165,250,.25),transparent_55%),radial-gradient(140%_100%_at_90%_100%,rgba(45,108,223,.28),transparent_50%),linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.04)),rgba(255,255,255,.12)]",
          className,
        ].join(" ")}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[20px] opacity-15 mix-blend-soft-light"
          style={{
            backgroundImage: `url("${NOISE}")`,
            backgroundSize: "220px 220px",
          }}
        />

        {items.map((item, i) => (
          <DockItem
            key={i}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </div>
  );
}
