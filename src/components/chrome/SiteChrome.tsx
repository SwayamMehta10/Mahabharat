"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { causalThreads, characters, epicEvents, parvas, warDays, parvaOfWarDay } from "@/lib/kb";
import { selectAccessibleParva, useEpicStore } from "@/lib/store";

const NAV_LINKS = [
  { href: "/family-tree", label: "The Kuru Line", hint: "Who begat whom" },
  { href: "/who", label: "Who", hint: "The figures of the epic" },
  { href: "/parvas", label: "The Eighteen Parvas", hint: "The books" },
  { href: "/war", label: "The Eighteen Days", hint: "Kurukshetra, day by day" },
  { href: "/war/strategy", label: "Sanjaya's Eye", hint: "The field as formation" },
  { href: "/threads", label: "The Web of Vows", hint: "What consequence remembers" },
  { href: "/gita", label: "The Song of the Lord", hint: "When time stood still" },
  { href: "/saga", label: "Turn the Wheel", hint: "Choose your path and depth" },
  { href: "/credits", label: "Credits", hint: "Sources and visual method" },
];

interface Hit {
  href: string;
  primary: string;
  secondary: string;
  group: "Who" | "Parvas" | "Days" | "Events" | "Threads";
}

/**
 * A gold drop falling down a dotted line, bottom-center - the invitation to
 * scroll, like Dark's. Appears only when the page actually scrolls; lets go
 * the moment the visitor does. Remounted per route via key={pathname}.
 */
function ScrollCue() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // content often settles a beat after navigation (animations, canvas)
    const check = () =>
      setShow(
        window.scrollY < 40 &&
          document.documentElement.scrollHeight > window.innerHeight + 120
      );
    const t1 = setTimeout(check, 700);
    const t2 = setTimeout(check, 2200);
    const onScroll = () => {
      if (window.scrollY > 60) setShow(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="scroll-cue" style={{ opacity: show ? 1 : 0 }} aria-hidden>
      <div className="scroll-cue-line">
        <span className="scroll-cue-dot" />
      </div>
      <span className="ui-label !text-[0.6rem] !text-ash/70">Scroll</span>
    </div>
  );
}

export default function SiteChrome() {
  const pathname = usePathname();
  // derived open state: the menu is open only on the route it was opened on,
  // so navigating anywhere closes it without any effect-driven setState
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const [query, setQuery] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const knownParva = useEpicStore(selectAccessibleParva);
  const experienceMode = useEpicStore((s) => s.experienceMode);
  const soundOn = useEpicStore((s) => s.soundOn);
  const setSoundOn = useEpicStore((s) => s.setSoundOn);

  // the entry gate keeps its own quiet chrome
  const hidden = pathname === "/";

  const openMenu = () => {
    setQuery("");
    setOpenedAt(pathname);
  };
  const closeMenu = () => setOpenedAt(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenedAt(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || !overlayRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      );
      gsap.fromTo(
        "[data-menu-item]",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.05, ease: "power3.out", delay: 0.15 }
      );
    }, overlayRef);
    return () => ctx.revert();
  }, [open]);

  const hits = useMemo<Hit[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: Hit[] = [];

    for (const c of characters) {
      if (c.firstParva > knownParva) continue;
      const hay = [c.name, c.deva, ...c.epithets, ...(c.weapons ?? []), ...c.parents, ...c.spouses, ...c.children].join(" ").toLowerCase();
      if (hay.includes(q)) {
        out.push({
          href: `/who/${c.id}`,
          primary: c.name,
          secondary: c.epithets[0] ?? c.deva,
          group: "Who",
        });
      }
    }
    for (const p of parvas) {
      if ([p.name, p.deva, p.meaning].join(" ").toLowerCase().includes(q)) {
        out.push({
          href: `/parvas#parva-${p.number}`,
          primary: p.name,
          secondary: p.meaning,
          group: "Parvas",
        });
      }
    }
    for (const d of warDays) {
      if (parvaOfWarDay(d.day) > knownParva) continue;
      if (d.title.toLowerCase().includes(q) || `day ${d.day}` === q) {
        out.push({
          href: `/war#day-${d.day}`,
          primary: `Day ${d.day} · ${d.title}`,
          secondary: "Kurukshetra",
          group: "Days",
        });
      }
    }
    for (const event of epicEvents) {
      if (event.parva > knownParva) continue;
      if ([event.title, event.deva, event.summary].join(" ").toLowerCase().includes(q)) {
        out.push({ href: `/drishti/${event.id}`, primary: event.title, secondary: "Drishti", group: "Events" });
      }
    }
    for (const thread of causalThreads) {
      if (!thread.parvas.some((parva) => parva <= knownParva)) continue;
      if ([thread.title, thread.kind, thread.summary].join(" ").toLowerCase().includes(q)) {
        out.push({ href: `/threads#${thread.id}`, primary: thread.title, secondary: thread.kind, group: "Threads" });
      }
    }
    return out.slice(0, 12);
  }, [query, knownParva]);

  if (hidden) return null;

  return (
    <>
      <ScrollCue key={pathname} />
      {/* fixed chrome */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between p-5">
        <button
          onClick={openMenu}
          aria-label="Open menu"
          className="pointer-events-auto group flex cursor-pointer flex-col gap-1.5 p-2"
        >
          <span className="block h-px w-7 bg-bone/80 transition-all group-hover:w-9 group-hover:bg-gold-bright" />
          <span className="block h-px w-9 bg-bone/80 transition-colors group-hover:bg-gold-bright" />
        </button>
        <Link
          href="/saga"
          aria-label="Turn the wheel: experience mode and narrative depth"
          className="pointer-events-auto p-2 text-bone/70 transition-colors hover:text-gold-bright"
        >
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
            <circle cx="13" cy="13" r="11" stroke="currentColor" strokeWidth="1" strokeDasharray="1 3.4" strokeLinecap="round" />
            <circle cx="13" cy="13" r="2" fill="currentColor" />
          </svg>
        </Link>
      </header>

      {/* overlay menu */}
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[45] flex flex-col overflow-y-auto bg-void/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between p-5">
            <p data-menu-item className="font-deva text-bone/60" style={{ letterSpacing: "0.5em" }}>
              म हा भा र त
            </p>
            <button
              onClick={closeMenu}
              aria-label="Close menu"
              className="ui-label cursor-pointer p-2 transition-colors hover:text-gold-bright"
            >
              Close
            </button>
          </div>

          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-10 px-6 pb-20 pt-8">
            {/* search */}
            <div data-menu-item>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Seek a name, vow, weapon, book or day…"
                autoFocus
                className="font-display w-full border-b border-dotted border-ash/40 bg-transparent pb-3 text-2xl font-light text-bone placeholder:text-ash/50 focus:border-gold focus:outline-none"
              />
              {query.trim().length >= 2 && (
                <ul className="mt-6 flex flex-col gap-1">
                  {hits.length === 0 && (
                    <li className="font-display italic text-ash">
                      Nothing by that name at this depth of the telling.
                    </li>
                  )}
                  {hits.map((h) => (
                    <li key={h.href + h.primary}>
                      <Link
                        href={h.href}
                        className="group flex items-baseline justify-between gap-4 py-2"
                      >
                        <span className="font-display text-xl text-bone/90 transition-colors group-hover:text-gold-bright">
                          {h.primary}
                        </span>
                        <span className="ui-label shrink-0 !text-ash/70">
                          {h.secondary}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* primary nav */}
            {query.trim().length < 2 && (
              <nav className="flex flex-col">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    data-menu-item
                    className="group flex items-baseline justify-between gap-4 border-b border-dotted border-ash/20 py-5"
                  >
                    <span className="font-display text-3xl font-light text-bone transition-colors group-hover:text-gold-bright">
                      {l.label}
                    </span>
                    <span className="ui-label shrink-0 !text-ash/70">{l.hint}</span>
                  </Link>
                ))}
              </nav>
            )}

            <div data-menu-item className="mt-auto flex flex-col items-center gap-3">
              <button
                onClick={() => setSoundOn(!soundOn)}
                aria-pressed={soundOn}
                className="ui-label -m-2 cursor-pointer p-3 transition-colors hover:text-gold-bright"
              >
                Sound {soundOn ? "On" : "Off"}
              </button>
              <p className="ui-label text-center !text-ash/50">
                {experienceMode === "open"
                  ? "Open epic · all eighteen parvas"
                  : `Guided telling · parva ${Math.max(knownParva, 0)} of 18`} · every fact cited to the Ganguli translation
              </p>
              <p className="font-display text-sm italic !normal-case text-ash/50">
                Some names, typed into the dark, answer back.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
