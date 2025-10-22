import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClientWritable, createSupabaseServerClientReadOnly } from '@/lib/supabase-server';
import { getPresets, createPreset, deletePreset } from '@/lib/presets';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClientReadOnly();
  const {
    data: { user },
  } = await supabase.auth.getUser();


  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const presets = await getPresets(user.id);
  return NextResponse.json(presets);
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClientWritable();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const preset = await req.json();
  const newPreset = await createPreset({ ...preset, user_id: user.id });

  if (newPreset) {
    return NextResponse.json(newPreset);
  } else {
    return NextResponse.json({ error: 'Failed to create preset' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
    const supabase = await createSupabaseServerClientWritable();
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    const { id } = await req.json();
    const success = await deletePreset(id);
  
    if (success) {
      return NextResponse.json({ message: 'Preset deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to delete preset' }, { status: 500 });
    }
  }
