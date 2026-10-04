import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { DrinkLog } from '@/domain/types';
import type { RemoteLogApi } from './sync';

const Row = z.object({
  id: z.string(), beverage_type_id: z.string(), volume_ml: z.number(), hydration_value_ml: z.number(),
  container_id: z.string().nullable(), logged_at: z.string(), tz: z.string(), source: z.string(),
  deleted_at: z.string().nullable(), created_at: z.string(), updated_at: z.string(),
});

export function createSupabaseLogApi(client: SupabaseClient, userId: string): RemoteLogApi {
  return {
    async upsertLogs(logs) {
      const rows = logs.map((l) => ({
        id: l.id, user_id: userId, beverage_type_id: l.drinkTypeId, volume_ml: l.volumeMl, hydration_value_ml: l.hydrationMl,
        // container ids for built-in vessels are local slugs, not UUIDs: only send real UUIDs
        container_id: /^[0-9a-f-]{36}$/i.test(l.containerId ?? '') ? l.containerId : null,
        logged_at: l.loggedAt, tz: l.tz, source: l.source, deleted_at: l.deletedAt ?? null,
        created_at: l.createdAt, updated_at: l.updatedAt,
      }));
      const { error } = await client.from('drink_logs').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
    },
    async fetchLogsSince(updatedAfter) {
      let q = client.from('drink_logs').select('*').eq('user_id', userId).order('updated_at', { ascending: true }).limit(1000);
      if (updatedAfter) q = q.gt('updated_at', updatedAfter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((raw): DrinkLog => {
        const r = Row.parse(raw);
        return {
          id: r.id, drinkTypeId: r.beverage_type_id, volumeMl: r.volume_ml, hydrationMl: r.hydration_value_ml,
          containerId: r.container_id ?? undefined, loggedAt: r.logged_at, tz: r.tz,
          source: r.source as DrinkLog['source'], createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at ?? undefined,
        };
      });
    },
  };
}
