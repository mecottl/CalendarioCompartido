import { supabase } from './supabase';

export interface Participant {
  id: string;
  name: string;
}

export async function getOrCreateParticipant(name: string): Promise<Participant> {
  const normalized = name.trim();

  const { data: existing, error: findError } = await supabase
    .from('participants')
    .select('id, name')
    .ilike('name', normalized)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing;

  const { data: created, error: insertError } = await supabase
    .from('participants')
    .insert({ name: normalized })
    .select('id, name')
    .single();

  if (insertError) throw insertError;
  return created;
}

export async function getAllParticipants(): Promise<Participant[]> {
  const { data, error } = await supabase
    .from('participants')
    .select('id, name')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getAvailability(participantId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('availability')
    .select('slot')
    .eq('participant_id', participantId);

  if (error) throw error;
  return (data ?? []).map((row) => row.slot);
}

export async function setAvailability(participantId: string, slots: string[]): Promise<void> {
  const uniqueSlots = Array.from(new Set(slots));

  const { error: deleteError } = await supabase
    .from('availability')
    .delete()
    .eq('participant_id', participantId);

  if (deleteError) throw deleteError;

  if (uniqueSlots.length === 0) return;

  const rows = uniqueSlots.map((slot) => ({ participant_id: participantId, slot }));
  const { error: insertError } = await supabase.from('availability').insert(rows);

  if (insertError) throw insertError;
}

export async function getAggregatedAvailability(): Promise<Record<string, string[]>> {
  const { data, error } = await supabase
    .from('availability')
    .select('slot, participants(name)');

  if (error) throw error;

  const counts: Record<string, string[]> = {};
  for (const row of data ?? []) {
    const name = (row as any).participants?.name;
    if (!name) continue;
    if (!counts[row.slot]) counts[row.slot] = [];
    counts[row.slot].push(name);
  }
  return counts;
}