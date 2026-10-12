"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useVillageConfig } from "./VillageConfig";
import { useI18n } from "@/lib/i18n";
import { WORKSHOP_ITEMS, type WorkshopItemId } from "@/lib/workshop";
import styles from "./SecretWorkshop.module.css";

const WorkshopScene = dynamic(() => import("./WorkshopScene"), { ssr: false });

export default function SecretWorkshop({ onClose }: { onClose: () => void }) {
  const { ownerLogin } = useVillageConfig();
  const { locale } = useI18n();
  const zh = locale === "zh";
  const root = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [selected, setSelected] = useState<WorkshopItemId | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const item = WORKSHOP_ITEMS.find((entry) => entry.id === selected);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);
    document.body.style.overflow = "hidden";
    document.body.style.cursor = "auto";
    if (document.pointerLockElement) document.exitPointerLock();
    const siblings = Array.from(root.current?.parentElement?.children ?? []).filter(
      (element): element is HTMLElement => element instanceof HTMLElement && element !== root.current,
    );
    const previousInert = siblings.map((element) => element.inert);
    siblings.forEach((element) => { element.inert = true; });
    close.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault(); event.stopImmediatePropagation(); onCloseRef.current(); return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(root.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]") ?? [])
        .filter((element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden");
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !root.current?.contains(document.activeElement))) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.cursor = "auto";
      siblings.forEach((element, index) => { element.inert = previousInert[index]; });
      window.removeEventListener("keydown", onKey, true);
      media.removeEventListener("change", updateMotion);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return <div ref={root} className={styles.root} role="dialog" aria-modal="true" aria-labelledby="workshop-title" data-testid="secret-workshop">
    <div className={styles.scene}>
      <WorkshopScene key={attempt} selected={selected} reducedMotion={reducedMotion} onSelect={setSelected} onReady={onReady} onError={onError} />
    </div>
    <div className={styles.shade} />
    <header className={styles.header}>
      <div className={styles.identity}>
        <span className={styles.eyebrow}>{ownerLogin} / {zh ? "主人樹屋" : "OWNER'S TREEHOUSE"}</span>
        <h1 id="workshop-title">{zh ? "秘密工作室" : "The secret workshop"}<span>✦</span></h1>
        <p>{zh ? "跟著小貓，來看看主人的點子。" : "Follow the cat. See where the ideas live."}</p>
      </div>
      <button ref={close} type="button" className={styles.close} onClick={onClose}>
        {zh ? "回到樹屋" : "Back to the tree"}<span aria-hidden="true">×</span>
      </button>
    </header>
    <nav className={styles.objects} aria-label={zh ? "探索桌上小物" : "Explore the desk"}>
      <button type="button" aria-pressed={selected === null} onClick={() => setSelected(null)}>{zh ? "整間工作室" : "The room"}</button>
      {WORKSHOP_ITEMS.map((entry) => <button key={entry.id} type="button" aria-pressed={selected === entry.id} onClick={() => setSelected(entry.id)}>
        <i style={{ background: entry.color }} />{entry.title}
      </button>)}
    </nav>
    {!ready && !failed && <div className={styles.loading} role="status">{zh ? "小貓正在開門…" : "The cat is opening the door…"}</div>}
    {failed && <div className={styles.loading} role="alert">
      <p>{zh ? "房間暫時無法顯示，你仍可閱讀桌上小物的介紹。" : "The room could not be displayed. You can still explore the projects below."}</p>
      <button type="button" onClick={() => { setFailed(false); setReady(false); setAttempt((value) => value + 1); }}>{zh ? "再試一次" : "Try again"}</button>
    </div>}
    <section className={styles.card} aria-live="polite" aria-atomic="true">
      <span className={styles.eyebrow}>{item ? (zh ? "桌上的小宇宙" : "ON THE DESK") : (zh ? "歡迎回家" : "MAKE YOURSELF AT HOME")}</span>
      <h2>{item?.title ?? (zh ? "小房間，大點子。" : "Small room. Big ideas.")}</h2>
      <p className={styles.subtitle}>{item ? (zh ? item.subtitleZh : item.subtitle) : (zh ? "AI 喵、StickBuddy，還有一台小小的 DGX Spark。" : "AI 喵, StickBuddy, and a miniature DGX Spark.")}</p>
      <p>{item ? (zh ? item.descriptionZh : item.description) : (zh ? "點桌上的小物，或用上方按鈕靠近看看。窗外是夜色，桌邊的小貓會陪你慢慢逛。" : "Click an object on the desk, or choose one above to take a closer look. The night is quiet, and the cat is keeping you company.")}</p>
      {item?.href && <a href={item.href} target="_blank" rel="noopener noreferrer">{zh ? "了解更多" : "Learn more"}<span aria-hidden="true">↗</span></a>}
    </section>
    <footer className={styles.footer}><span>✦ {zh ? "一間藏在樹上的創作基地" : "A little creative hideaway in the tree"}</span><span>ESC / {zh ? "回到村落" : "BACK TO THE VILLAGE"}</span></footer>
  </div>;
}
