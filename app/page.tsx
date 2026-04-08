"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, Calendar, MapPin, Menu, X } from "lucide-react";
import Link from "next/link";

type NavMode = "all" | "hide-experience" | "hide-agenda" | "hide-all";

const navLinks = [
  { href: "#experience", label: "Experience" },
  { href: "#agenda", label: "Agenda" },
  { href: "#register", label: "Register" },
] as const;

const LUMA_EVENT_ID = "evt-KSYNm1rNe5djJFX";
const LUMA_EVENT_URL = `https://luma.com/event/${LUMA_EVENT_ID}`;

export default function Home() {
  const partnerRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const lumaTriggerRef = useRef<HTMLAnchorElement>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [navMode, setNavMode] = useState<NavMode>("all");
  const { scrollYProgress: partnerScroll } = useScroll({
    target: partnerRef,
    offset: ["start end", "end start"],
  });
  const partnerImageY = useTransform(partnerScroll, [0, 1], ["-10%", "10%"]);

  useEffect(() => {
    const video = heroVideoRef.current;

    if (!video) return;

    const connection = (
      navigator as Navigator & {
        connection?: {
          effectiveType?: string;
          saveData?: boolean;
        };
      }
    ).connection;
    const shouldUseLowQuality =
      connection?.saveData === true ||
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "2g" ||
      connection?.effectiveType === "3g";
    const source = shouldUseLowQuality
      ? video.dataset.srcLow
      : video.dataset.srcDefault;

    if (!source) return;

    video.src = source;
    video.load();
    void video.play().catch(() => undefined);

    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);

  useEffect(() => {
    const syncLumaOverlay = () => {
      const overlay = document.querySelector<HTMLElement>(
        ".luma-checkout--overlay",
      );

      document.body.classList.toggle("modalOpen", Boolean(overlay));
      document.body.classList.toggle("lumaThemeActive", Boolean(overlay));
    };

    syncLumaOverlay();

    const observer = new MutationObserver(() => {
      syncLumaOverlay();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      document.body.classList.remove("modalOpen");
      document.body.classList.remove("lumaThemeActive");
    };
  }, []);

  useEffect(() => {
    if (!isMobileNavOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav-mode]"),
    );

    if (!sections.length) return;

    const isNavMode = (value: string | undefined): value is NavMode => {
      return (
        value === "all" ||
        value === "hide-experience" ||
        value === "hide-agenda" ||
        value === "hide-all"
      );
    };

    const updateNavMode = () => {
      const viewportCenter = window.innerHeight / 2;
      let nextMode: NavMode = "all";

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();

        if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
          const mode = section.dataset.navMode;

          if (isNavMode(mode)) {
            nextMode = mode;
          }
        }
      });

      setNavMode((currentMode) =>
        currentMode === nextMode ? currentMode : nextMode,
      );
    };

    let ticking = false;

    const requestUpdate = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        updateNavMode();
        ticking = false;
      });
    };

    updateNavMode();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const visibleNavLinks = navLinks.filter(({ label }) => {
    if (navMode === "hide-all") {
      return false;
    }

    if (navMode === "hide-experience") {
      return label !== "Experience";
    }

    if (navMode === "hide-agenda") {
      return label !== "Agenda";
    }

    return true;
  });

  const openLumaCheckout = () => {
    lumaTriggerRef.current?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      }),
    );
  };

  const handleRegisterClick = () => {
    setIsMobileNavOpen(false);
    openLumaCheckout();
  };

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  return (
    <main className="relative bg-black w-full">
      <a
        ref={lumaTriggerRef}
        href={LUMA_EVENT_URL}
        className="luma-checkout--button absolute size-px overflow-hidden opacity-0 pointer-events-none"
        data-luma-action="checkout"
        data-luma-event-id={LUMA_EVENT_ID}
        aria-hidden="true"
        tabIndex={-1}
      >
        Open checkout
      </a>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 md:p-10 mix-blend-difference text-white pointer-events-none">
        <Link
          href="/"
          className="font-display font-bold text-2xl tracking-tighter pointer-events-auto"
        >
          FORGETECH
        </Link>
        <div className="hidden md:flex gap-12 text-xs font-medium tracking-[0.2em] uppercase pointer-events-auto">
          {visibleNavLinks.map((link) =>
            link.href === "#register" ? (
              <button
                key={link.href}
                type="button"
                onClick={handleRegisterClick}
                className="hover:text-zinc-400 uppercase transition-colors"
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-zinc-400 transition-colors"
              >
                {link.label}
              </Link>
            ),
          )}
        </div>
        <button
          type="button"
          aria-label={
            isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isMobileNavOpen}
          aria-controls="mobile-nav-panel"
          onClick={() => setIsMobileNavOpen((open) => !open)}
          className="md:hidden pointer-events-auto"
        >
          {isMobileNavOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>
      {isMobileNavOpen ? (
        <div className="md:hidden fixed inset-0 z-40 pt-24 bg-black/65">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMobileNav}
            className="absolute inset-0 bg-black/70"
          />
          <div
            id="mobile-nav-panel"
            className="relative w-full text-center text-white shadow-lg"
          >
            <div className="flex flex-col gap-5 text-sm font-semibold uppercase tracking-[0.2em]">
              {visibleNavLinks.map((link) =>
                link.href === "#register" ? (
                  <button
                    key={link.href}
                    type="button"
                    onClick={handleRegisterClick}
                    className="text-center uppercase hover:text-zinc-400 transition-colors"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileNav}
                    className="hover:text-zinc-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          </div>
        </div>
      ) : null}

      <section
        data-nav-mode="all"
        className="sticky top-0 h-dvh w-full bg-black flex flex-col justify-between p-6 md:p-10 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <video
            ref={heroVideoRef}
            data-src-default="/forgesummit-720.mp4"
            data-src-low="/forgesummit-480.mp4"
            poster="/hero-video.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            disablePictureInPicture
            disableRemotePlayback
            className="h-full w-full object-cover opacity-55"
          >
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-linear-to-b from-black/45 via-black/20 to-black"></div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center items-center mt-20">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <h1 className="font-display text-[15vw] md:text-[12vw] leading-[0.85] font-bold tracking-tighter text-center uppercase mix-blend-overlay text-white/90">
              ForgeTech
            </h1>
          </motion.div>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="font-display text-[8vw] md:text-[6vw] leading-none font-bold tracking-tighter text-center uppercase text-zinc-500">
              Summit &apos;26
            </h2>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-xs md:text-sm uppercase tracking-[0.15em]"
        >
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> July 31, 2026
            </p>
            <p className="flex items-center gap-2 text-zinc-500">
              <MapPin className="w-4 h-4" /> Nairobi, Kenya
            </p>
          </div>
          <div className="text-left md:text-right max-w-xs md:max-w-sm">
            <p className="leading-relaxed">
              Exclusive, Invitation-Only for Global Leaders, Innovators &
              Visionaries.
            </p>
          </div>
        </motion.div>
      </section>

      <section
        id="experience"
        data-nav-mode="hide-experience"
        className="relative min-h-screen w-full bg-zinc-900 flex items-center justify-center overflow-hidden py-24"
      >
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="https://picsum.photos/seed/abstractdark/1920/1080?grayscale"
            alt="Experience"
            fill
            className="object-cover opacity-10"
          />
        </div>
        <div className="relative z-10 w-full max-w-350 mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, margin: "-20%" }}
          >
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase mb-8 leading-[0.9]">
              The{" "}
              <span className="text-3xl tracking-tighter md:text-5xl font-display font-bold text-transparent bg-clip-text bg-linear-to-b from-[#dc85e7] to-[#cb30e0c6]">
                forgetech
              </span>
              <br />
              Experience
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 max-w-md leading-relaxed font-light">
              Where 300+ global innovators from 30+ nationalities gather for a
              single transformative day. Turning insights into action, ideas
              into collaborations.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 md:gap-8 h-[50vh] lg:h-[70vh]">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true }}
              className="space-y-4 md:space-y-8 pt-12 lg:pt-24 *:opacity-80 *:hover:opacity-100 *:transition-opacity *:duration-500"
            >
              <div className="relative h-[60%] w-full overflow-hidden rounded-sm">
                <Image
                  src="/experience-left.jpg"
                  alt="Gallery 1"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000"
                />
              </div>
              <div className="relative h-[40%] w-full overflow-hidden rounded-sm">
                <Image
                  src="/experience-right.jpg"
                  alt="Gallery 2"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              viewport={{ once: true }}
              className="space-y-4 md:space-y-8 pb-12 lg:pb-24 *:opacity-80 *:hover:opacity-100 *:transition-opacity *:duration-500"
            >
              <div className="relative h-[40%] w-full overflow-hidden rounded-sm">
                <Image
                  src="/experience-top.png"
                  alt="Gallery 3"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000"
                />
              </div>
              <div className="relative h-[60%] w-full overflow-hidden rounded-sm">
                <Image
                  src="/experience-bottom-left.png"
                  alt="Gallery 4"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        id="about"
        data-nav-mode="hide-all"
        className="relative z-20 w-full bg-black text-white"
      >
        <div className="w-full h-px bg-zinc-800" />

        <div className="max-w-350 mx-auto px-6 md:px-10 py-24 md:py-40">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20 md:mb-32">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="relative"
            >
              <span
                className="absolute -left-4 -top-6 text-[11vw] font-black tracking-tighter text-zinc-900 select-none pointer-events-none leading-none uppercase"
                aria-hidden
              >
                WHY
              </span>
              <h2 className="relative font-display text-6xl md:text-8xl lg:text-[9vw] font-black tracking-tighter uppercase leading-[0.85] z-10 text-transparent bg-clip-text bg-linear-to-b from-white to-zinc-600">
                Why
                <br />
                Attend?
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-zinc-400 text-sm md:text-lg leading-relaxed font-light max-w-md lg:max-w-xs xl:max-w-sm lg:text-right"
            >
              ForgeTech Summit is <br />a premium,{" "}
              <span className="font-display italic font-medium text-white">
                invitation-only
              </span>{" "}
              gathering designed to connect top executives and visionaries.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="lg:col-span-7 relative h-[55vw] max-h-170 overflow-hidden border border-zinc-800"
            >
              <Image
                src="/why-attend.png"
                alt="Summit experience"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
                className="absolute bottom-8 left-8 right-8 md:right-auto md:max-w-sm"
              >
                <p className="text-2xl md:text-3xl font-bold tracking-tight leading-snug">
                  &ldquo;Gain exclusive insights, explore frontier technologies,
                  unlock strategic partnerships.&rdquo;
                </p>
                <div className="mt-4 w-20 h-px bg-white" />
              </motion.div>
            </motion.div>

            <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-zinc-800">
              {[
                {
                  num: "10+",
                  label: "Global Innovators",
                  sub: "Senior leaders & founders from every continent.",
                },
                {
                  num: "5+",
                  label: "Nationalities",
                  sub: "A genuinely global cross-section of decision makers.",
                },
                {
                  num: "1",
                  label: "Transformative Day",
                  sub: "Concentrated, curated, unforgettable.",
                },
                {
                  num: "∞",
                  label: "Opportunities",
                  sub: "Co-investments, partnerships & collaborations forged here.",
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: i * 0.12 }}
                  viewport={{ once: true }}
                  className="group flex items-center gap-6 px-8 py-8 hover:bg-zinc-900 transition-colors duration-500 cursor-default lg:sticky bg-black z-10 lg:h-full"
                  style={{ top: `${i * 130}px` }}
                >
                  <span className="font-black text-4xl md:text-5xl tracking-tighter text-white leading-none group-hover:text-zinc-300 transition-colors duration-300 shrink-0 w-24">
                    {stat.num}
                  </span>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] font-semibold text-zinc-300 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                      {stat.sub}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 md:mt-24 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12"
          >
            <div className="h-px flex-1 bg-zinc-800" />
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
              Invitation Only · July 31, 2026 · Nairobi, Kenya
            </p>
            <div className="h-px flex-1 bg-zinc-800" />
          </motion.div>
        </div>
      </section>

      <section
        data-nav-mode="hide-all"
        className="relative z-20 w-full bg-white text-black overflow-hidden"
      >
        <div className="w-full h-px bg-zinc-200" />

        <div className="w-full overflow-hidden py-5 border-b border-zinc-200 bg-white">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="flex whitespace-nowrap"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-300 px-10"
              >
                Executives &nbsp;·&nbsp; Founders &nbsp;·&nbsp; Innovators
                &nbsp;·&nbsp; Visionaries &nbsp;·&nbsp; Investors &nbsp;·&nbsp;
              </span>
            ))}
          </motion.div>
        </div>

        <div className="max-w-350 mx-auto px-6 md:px-10 py-24 md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="mb-20 md:mb-32"
          >
            <h2 className="font-display text-[13vw] md:text-[11vw] font-black tracking-tighter uppercase leading-[0.8] text-black">
              Who&apos;s
              <br />
              <span className="text-stroke-black">It For?</span>
            </h2>
            <style jsx>{`
              .text-stroke-black {
                -webkit-text-stroke: 3px black;
                color: transparent;
              }
              @media (max-width: 768px) {
                .text-stroke-black {
                  -webkit-text-stroke: 2px black;
                }
              }
            `}</style>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-zinc-200">
            {[
              {
                role: "Top executives",
                icon: "01",
                desc: "CEOs, CTOs, and board members navigating the intersection of technology, governance, and global markets.",
                imgSeed: "/vibes-main.png",
              },
              {
                role: "Venture Founders",
                icon: "02",
                desc: "VCs, family offices and institutional investors scouting frontier opportunities across emerging markets are invited to connect with like-minded peers.",
                imgSeed: "/partner.png",
              },
              {
                role: "Innovators & visionaries",
                icon: "03",
                desc: "Builders disrupting industries — from deep-tech to infrastructure — seeking capital, community, and collaboration.",
                imgSeed: "/vibes-2.png",
              },
            ].map((persona, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                viewport={{ once: true }}
                className={`group relative overflow-hidden border-b lg:border-b-0 border-zinc-200 ${i < 2 ? "lg:border-r" : ""}`}
              >
                <div className="relative h-72 w-full overflow-hidden">
                  <Image
                    src={persona.imgSeed}
                    alt={persona.role}
                    fill
                    className="object-cover group-hover:scale-105 transition-all duration-1000 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-700" />
                  <span className="absolute top-5 right-5 text-xs font-black text-white/60 tracking-[0.3em]">
                    {persona.icon}
                  </span>
                </div>

                <div className="p-8 bg-white group-hover:bg-zinc-50 transition-colors duration-500">
                  <h3 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight mb-4 leading-tight">
                    {persona.role}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                    {persona.desc}
                  </p>
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-black border-b border-black pb-px group/link">
                    Learn more
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:rotate-45 transition-transform duration-300" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 md:mt-24 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-t border-zinc-200 pt-12"
          >
            <p className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-tight max-w-md">
              Is This You?
            </p>
            <button
              type="button"
              onClick={openLumaCheckout}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-black text-white text-xs uppercase font-bold tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-colors duration-300"
            >
              Request Your Invite
              <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
            </button>
          </motion.div>
        </div>
      </section>

      <section
        id="partner"
        ref={partnerRef}
        data-nav-mode="hide-all"
        className="relative z-20 w-full min-h-screen bg-black overflow-hidden flex flex-col"
      >
        <div className="relative z-20 flex items-center justify-between px-6 md:px-10 py-6 border-b border-zinc-800">
          <span className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-semibold">
            Partnership
          </span>
          <span className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-semibold">
            ForgeTech Summit &apos;26
          </span>
        </div>

        <motion.div
          style={{ y: partnerImageY }}
          className="absolute inset-0 z-0"
        >
          <Image
            src="https://picsum.photos/seed/partner9/1920/1200?grayscale"
            alt="Partner"
            fill
            className="object-cover opacity-25"
          />
        </motion.div>

        <div
          className="absolute bottom-0 right-0 w-1/2 h-full z-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.03) 50%)",
          }}
        />

        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-800 z-10 hidden lg:block" />

        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-350 mx-auto px-6 md:px-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-0 py-24 md:py-32">
            <div className="flex flex-col justify-between pr-0 lg:pr-16 xl:pr-24">
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="my-auto"
              >
                <h2 className="font-display text-[10vw] lg:text-[6.5vw] font-black tracking-tighter uppercase leading-[0.82] text-white mb-10">
                  Partner
                  <br />
                  with
                  <br />
                  ForgeTech
                </h2>
                <p className="text-zinc-400 text-lg md:text-xl leading-relaxed font-light max-w-md mb-12">
                  ForgeTech Summit is invitation-only, designed to offer a
                  premium, intimate environment for global leaders. Join a
                  trusted network of visionaries, decision-makers, and
                  innovators shaping the future of technology and business.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                viewport={{ once: true }}
              >
                <a
                  href="mailto:hello@forgetechsummit.com?subject=Partnership%20Inquiry"
                  className="group relative inline-flex items-center justify-center px-10 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs overflow-hidden rounded-full w-fit"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Become a Partner
                    <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-zinc-200 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform ease-out duration-500" />
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              viewport={{ once: true }}
              className="hidden lg:flex flex-col justify-center pl-16 xl:pl-24 gap-8"
            >
              <div className="relative w-full aspect-4/5 overflow-hidden">
                <Image
                  src="/partner.png"
                  alt="Partner network"
                  fill
                  className="object-cover hover:scale-105 transition-all duration-1000 opacity-90 hover:opacity-100"
                />
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <line
                    x1="0"
                    y1="100"
                    x2="100"
                    y2="0"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="0.5"
                  />
                </svg>
              </div>

              <div className="border-t border-zinc-800 pt-6 flex items-end justify-between">
                <div>
                  <p className="text-5xl font-black tracking-tighter text-white">
                    2026
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mt-1">
                    Inaugural Edition
                  </p>
                </div>
                <p className="text-xs text-zinc-500 text-right max-w-40 leading-relaxed">
                  Limited sponsorship tiers available. Inquire early.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="relative z-20 border-t border-zinc-800 px-6 md:px-10 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
            Limited Sponsorship Opportunities Available
          </p>
          <a
            href="mailto:hello@forgetechsummit.com"
            className="text-xs uppercase tracking-[0.25em] text-zinc-400 hover:text-white transition-colors"
          >
            hello@forgetechsummit.com ↗
          </a>
        </div>
      </section>

      <section
        id="agenda"
        data-nav-mode="hide-agenda"
        className="sticky top-0 h-screen w-full bg-[#e5e5e5] text-black flex items-center justify-center overflow-hidden"
      >
        <div className="w-full max-w-350 mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 lg:mb-24 gap-8"
          >
            <h2 className="font-display text-6xl md:text-8xl lg:text-[10vw] leading-[0.8] font-bold tracking-tighter uppercase">
              Agenda
            </h2>
            <div className="text-left lg:text-right max-w-sm">
              <p className="text-xl md:text-2xl font-medium tracking-tight">
                Curated Sessions
              </p>
              <p className="text-zinc-500 mt-2">
                For the visionary mind. A front-row view of tomorrow&apos;s most
                transformative opportunities.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
            {[
              {
                time: "31st July, 2026",
                title: "Forge Connections",
                desc: [
                  "Opening keynote by a global thought leader.",
                  "Fireside chats with pioneering entrepreneurs.",
                  "Curated networking sessions to spark high-value connections.",
                ],
              },
              {
                time: "9:00AM East African Time",
                title: "Ignite Insights",
                desc: [
                  "Focused breakout sessions on AI, BFSI, digital infrastructure, and frontier technologies.",
                  "Executive roundtables for strategy and collaboration.",
                  "Panel discussions with industry disruptors.",
                ],
              },
              {
                time: "Nairobi, Kenya",
                title: "Shape the Future",
                desc: [
                  "Hands-on workshops with actionable takeaways",
                  "Curated experiences exploring Nairobi's innovation ecosystem.",
                  "Closing session celebrating connections, insights, and collaborations.",
                ],
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="group border-t-2 border-black/10 pt-6 hover:border-black transition-colors duration-500"
              >
                <div className="text-sm font-bold tracking-[0.2em] mb-6">
                  {item.time}
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-bold uppercase mb-4 group-hover:translate-x-2 transition-transform duration-500">
                  {item.title}
                </h3>
                <p className="text-zinc-600 leading-relaxed text-sm">
                  {item.desc.map((line, idx) => (
                    <span key={idx} className="block">
                      ✓ {line}
                    </span>
                  ))}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="register"
        data-nav-mode="all"
        className="sticky top-0 h-screen w-full bg-black text-white flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="https://picsum.photos/seed/ctafashion/1920/1080?grayscale"
            alt="CTA Background"
            fill
            className="object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        </div>
        <div className="relative z-10 text-center flex flex-col items-center px-6">
          <motion.h2
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="font-display text-[12vw] md:text-[10vw] leading-[0.85] font-bold tracking-tighter uppercase mb-12 mix-blend-overlay text-white/90"
          >
            Request
            <br />
            Invite
          </motion.h2>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <button
              type="button"
              onClick={openLumaCheckout}
              className="group relative inline-flex items-center justify-center px-10 py-5 bg-white text-black font-bold uppercase tracking-[0.2em] text-sm overflow-hidden rounded-full"
            >
              <span className="relative z-10 flex items-center gap-3">
                Join the Summit{" "}
                <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-zinc-200 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform ease-out duration-500"></div>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            viewport={{ once: true }}
            className="mt-16 flex flex-col md:flex-row gap-8 text-xs tracking-[0.15em] uppercase text-zinc-400"
          >
            <a
              href="mailto:hello@forgetechsummit.com?subject=Partnership%20Inquiry"
              className="hover:text-white transition-colors"
            >
              Become a Partner
            </a>
            <span className="hidden md:inline">•</span>
            <a
              href="mailto:hello@forgetechsummit.com?subject=Press%20Inquiry"
              className="hover:text-white transition-colors"
            >
              Press Inquiries
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
