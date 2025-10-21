import { createSupabaseServerClientWritable } from '@/utils/supabase/server';
import { Preset } from './types';

export async function getPresets(userId: string): Promise<Preset[]> {
  const supabase = await createSupabaseServerClientWritable();
  const { data, error } = await supabase
    .from('presets')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching presets:', error);
    return [];
  }

  return data as Preset[];
}

export async function createPreset(preset: Omit<Preset, 'id'>): Promise<Preset | null> {
  const supabase = await createSupabaseServerClientWritable();
  const { data, error } = await supabase
    .from('presets')
    .insert([preset])
    .select()
    .single();

  if (error) {
    console.error('Error creating preset:', error);
    return null;
  }

  return data;
}

export async function updatePreset(preset: Preset): Promise<Preset | null> {
  const supabase = await createSupabaseServerClientWritable();
  const { data, error } = await supabase
    .from('presets')
    .update(preset)
    .eq('id', preset.id)
    .single();

  if (error) {
    console.error('Error updating preset:', error);
    return null;
  }

  return data as Preset;
}

export async function deletePreset(presetId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClientWritable();
  const { error } = await supabase
    .from('presets')
    .delete()
    .eq('id', presetId);

  if (error) {
    console.error('Error deleting preset:', error);
    return false;
  }

  return true;
}
