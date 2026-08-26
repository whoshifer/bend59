"use client";

import { useSyncExternalStore } from "react";

// Корзина КП хранится в localStorage, поэтому состав запроса переживает
// перезагрузку страницы и закрытие браузера. Состояние раздаётся компонентам
// через useSyncExternalStore: шапка, каталог и форма всегда синхронны.

const STORAGE_KEY = "bend_kp_articles";
const KP_EVENT = "bend:kp-changed";
const EMPTY: string[] = [];

let snapshotCache: string[] | null = null;

function parse(raw: string | null): string[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
  } catch {
    return EMPTY;
  }
}

export function readKpArticles(): string[] {
  if (typeof window === "undefined") return EMPTY;
  if (snapshotCache) return snapshotCache;
  snapshotCache = parse(window.localStorage.getItem(STORAGE_KEY));
  return snapshotCache;
}

function writeKpArticles(articles: string[]) {
  snapshotCache = articles;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  } catch {
    // Приватный режим или переполненный storage — работаем в памяти сессии.
  }
  window.dispatchEvent(new CustomEvent(KP_EVENT));
}

/** Добавляет артикул, если его ещё нет. */
export function addToKp(article: string) {
  const current = readKpArticles();
  if (!current.includes(article)) writeKpArticles([...current, article]);
}

export function removeFromKp(article: string) {
  writeKpArticles(readKpArticles().filter((item) => item !== article));
}

export function clearKp() {
  writeKpArticles([]);
}

function subscribe(listener: () => void): () => void {
  const onCustom = () => listener();
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === STORAGE_KEY) {
      snapshotCache = null; // другая вкладка могла изменить состав
      listener();
    }
  };
  window.addEventListener(KP_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(KP_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

/** Реактивное состояние корзины КП для клиентских компонентов. */
export function useKpArticles(): string[] {
  return useSyncExternalStore(subscribe, readKpArticles, getServerSnapshot);
}
