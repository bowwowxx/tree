"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useI18n, type MsgKey } from "@/lib/i18n";
import { normalizeHouseLogin, type HouseLookup } from "@/lib/findHouse";
import { readStorage, writeStorage } from "@/lib/storage";
import { CloseIcon, SearchIcon, StarIcon } from "./Icons";

const STORAGE_KEY = "star-tree-my-house-login";

export default function FindMyHouse({ repo, onFind, onClose }: {
  repo: string;
  onFind: (login: string) => Promise<HouseLookup | "found">;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const request = useRef(0);
  const [login, setLogin] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<HouseLookup | "invalid" | null>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    setLogin(readStorage(STORAGE_KEY) ?? "");
    dialog.current?.showModal();
    input.current?.focus();
    return () => {
      request.current += 1;
      previousFocus?.focus();
    };
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const normalized = normalizeHouseLogin(login);
    if (!normalized) { setStatus("invalid"); input.current?.focus(); return; }
    writeStorage(STORAGE_KEY, normalized);
    setBusy(true);
    setStatus(null);
    const id = ++request.current;
    try {
      const result = await onFind(normalized);
      if (id !== request.current) return;
      if (result === "found") onClose();
      else setStatus(result);
    } catch {
      if (id === request.current) setStatus("unavailable");
    } finally {
      if (id === request.current) setBusy(false);
    }
  };

  return (
    <dialog ref={dialog} aria-labelledby="find-house-title" onCancel={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="m-auto w-[calc(100%_-_2rem)] max-w-sm rounded-3xl border border-[#c5aa77]/30 bg-[#101b14] p-0 text-[#f3e7cf] shadow-2xl backdrop:bg-black/55 backdrop:backdrop-blur-sm">
      <div className="relative p-6">
        <button type="button" onClick={onClose} aria-label={t("a11y.close")} className="absolute right-4 top-4 rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-[#b9e78b]">
          <CloseIcon className="h-4 w-4" />
        </button>
        <span className="mb-4 grid h-11 w-11 place-items-center rounded-2xl border border-[#b9e78b]/20 bg-[#b9e78b]/10 text-[#b9e78b]"><SearchIcon className="h-5 w-5" /></span>
        <h2 id="find-house-title" className="pr-5 text-xl font-semibold">{t("findHouse.title")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/55">{t("findHouse.intro")}</p>
        <form onSubmit={submit} className="mt-5 space-y-3" aria-busy={busy}>
          <label htmlFor="my-house-login" className="block text-xs font-medium text-white/65">{t("findHouse.account")}</label>
          <input ref={input} id="my-house-login" value={login} disabled={busy} autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={80} placeholder="@bowwowxx"
            onChange={(event) => { setLogin(event.target.value); setStatus(null); }}
            aria-invalid={status === "invalid"} aria-describedby={status ? "find-house-status" : undefined}
            className="h-12 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-base text-white outline-none focus:border-[#b9e78b]/60 disabled:opacity-60" />
          <button type="submit" disabled={busy} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#b9e78b] text-sm font-semibold text-[#182715] transition hover:bg-[#ccedae] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9e78b] disabled:opacity-60">
            <SearchIcon className="h-4 w-4" />{t(busy ? "findHouse.checking" : "findHouse.go")}
          </button>
          {status && <p id="find-house-status" role="status" className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-[#e5d5b6]">{t(("findHouse." + status) as MsgKey)}</p>}
        </form>
        <a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer" className="mt-5 flex items-center gap-2 text-xs text-[#e6c485] underline-offset-4 hover:underline">
          <StarIcon className="h-4 w-4 shrink-0" />{t("findHouse.star")}
        </a>
        <p className="mt-2 break-all text-[11px] text-white/35">{repo}</p>
      </div>
    </dialog>
  );
}
