import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DayKey } from '@/domain/dates';
import type { Award } from '@/domain/rewards';
import { jsonStorage } from './storage';

export interface ChallengeRun { startedOn: DayKey; completedOn?: DayKey }
export interface LedgerEntry { xp: number; kind: Award['kind']; title: string; at: string }

interface RewardsState {
  /** Idempotent XP ledger keyed by award id. Never shrinks, so deleting a log can't revoke earned XP. */
  ledger: Record<string, LedgerEntry>;
  challenges: Record<string, ChallengeRun>;
  readArticles: string[];
  bookmarks: string[];
  /** Adds unseen awards; returns only the new ones. */
  applyAwards: (awards: Award[], at?: string) => Award[];
  startChallenge: (id: string, today: DayKey) => void;
  completeChallenge: (id: string, today: DayKey) => void;
  abandonChallenge: (id: string) => void;
  markRead: (id: string) => void;
  toggleBookmark: (id: string) => void;
  clear: () => void;
}

export const totalXp = (ledger: Record<string, LedgerEntry>) => Object.values(ledger).reduce((s, e) => s + e.xp, 0);

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set, get) => ({
      ledger: {}, challenges: {}, readArticles: [], bookmarks: [],
      applyAwards: (awards, at = new Date().toISOString()) => {
        const fresh = awards.filter((a, i) => !get().ledger[a.id] && awards.findIndex((b) => b.id === a.id) === i);
        if (!fresh.length) return [];
        set((s) => ({ ledger: { ...s.ledger, ...Object.fromEntries(fresh.map((a) => [a.id, { xp: a.xp, kind: a.kind, title: a.title, at }])) } }));
        return fresh;
      },
      startChallenge: (id, today) => set((s) => ({ challenges: { ...s.challenges, [id]: { startedOn: today } } })),
      completeChallenge: (id, today) => set((s) => (s.challenges[id] && !s.challenges[id]!.completedOn ? { challenges: { ...s.challenges, [id]: { ...s.challenges[id]!, completedOn: today } } } : s)),
      abandonChallenge: (id) => set((s) => { const { [id]: _removed, ...rest } = s.challenges; return { challenges: rest }; }),
      markRead: (id) => set((s) => (s.readArticles.includes(id) ? s : { readArticles: [...s.readArticles, id] })),
      toggleBookmark: (id) => set((s) => ({ bookmarks: s.bookmarks.includes(id) ? s.bookmarks.filter((b) => b !== id) : [...s.bookmarks, id] })),
      clear: () => set({ ledger: {}, challenges: {}, readArticles: [], bookmarks: [] }),
    }),
    { name: 'plink.rewards.v1', storage: jsonStorage, partialize: (s) => ({ ledger: s.ledger, challenges: s.challenges, readArticles: s.readArticles, bookmarks: s.bookmarks }) },
  ),
);
