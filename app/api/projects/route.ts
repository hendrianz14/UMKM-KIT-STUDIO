import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase-route';
import { getFirebaseBucket } from '@/lib/firebase-admin';
import { uploadProjectImage, type UploadedImageInfo } from '@/lib/firebase-storage';

export const runtime = 'nodejs';

type IncomingProjectPayload = {
  title: string;
  imageUrl: string;
  caption: string;
  aspectRatio: string;
  promptDetails?: string | null;
  promptFull?: string | null;
  type: string;
};

export async function POST(request: Request) {
  let uploadedImage: UploadedImageInfo | null = null;

  try {
    const projectData: IncomingProjectPayload = await request.json();
    if (!projectData?.imageUrl) {
      return NextResponse.json({ error: 'Gambar hasil generate tidak ditemukan.' }, { status: 400 });
    }

    const supabase = await supabaseRoute();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Anda harus login untuk menyimpan proyek.' }, { status: 401 });
    }

    let finalImageUrl: string | null = null;
    let finalStoragePath: string | null = null;

    // Jika imageUrl adalah data URL, upload ke Firebase Storage.
    // Jika imageUrl adalah URL biasa (http/https), simpan URL apa adanya tanpa upload ulang.
    if (projectData.imageUrl?.startsWith('data:')) {
      uploadedImage = await uploadProjectImage({
        dataUrl: projectData.imageUrl,
        userId: user.id,
      });
      finalImageUrl = uploadedImage.publicUrl;
      finalStoragePath = uploadedImage.storagePath;
    } else {
      finalImageUrl = projectData.imageUrl;
      finalStoragePath = null;
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        title: projectData.title,
        type: projectData.type,
        caption: projectData.caption,
        image_url: finalImageUrl,
        image_storage_path: finalStoragePath,
        aspect_ratio: projectData.aspectRatio,
        prompt_details: projectData.promptDetails ?? null,
        prompt_full: projectData.promptFull ?? null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      id: data.id,
      title: data.title,
      imageUrl: data.image_url,
      imageStoragePath: data.image_storage_path ?? null,
      caption: data.caption,
      aspectRatio: data.aspect_ratio,
      promptDetails: data.prompt_details,
      promptFull: data.prompt_full,
      type: data.type,
      user_id: data.user_id,
      created_at: data.created_at,
    });
  } catch (error) {
    if (uploadedImage) {
      try {
        await getFirebaseBucket()
          .file(uploadedImage.storagePath)
          .delete({ ignoreNotFound: true });
      } catch (cleanupError) {
        console.error('Project image cleanup failed:', cleanupError);
      }
    }

    console.error('Project creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to create project. ${errorMessage}` }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await supabaseRoute();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Anda harus login untuk melihat galeri.' }, { status: 401 });
    }

    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const offsetParam = url.searchParams.get('offset');
    const countsParam = url.searchParams.get('counts');
    const limit = Math.max(1, Math.min(100, Number(limitParam) || 0));
    const offset = Math.max(0, Number(offsetParam) || 0);
    const wantCounts = countsParam === '1' || countsParam === 'true';

    let data;
    let error;
    let total: number | null = null;

    async function countCategories() {
      // images: image_url NOT NULL AND (caption IS NULL OR caption = '')
      const imgRes = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .not('image_url', 'is', null)
        .or('caption.is.null,caption.eq.') as any;

      // projects: image_url NOT NULL AND caption NOT NULL AND caption <> ''
      const prjRes = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .not('image_url', 'is', null)
        .not('caption', 'is', null)
        .neq('caption', '');

      // texts: image_url IS NULL AND caption NOT NULL AND caption <> ''
      const txtRes = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('image_url', null)
        .not('caption', 'is', null)
        .neq('caption', '');

      return {
        images: imgRes.count || 0,
        projects: prjRes.count || 0,
        texts: txtRes.count || 0,
      } as { images: number; projects: number; texts: number };
    }

    if (limit) {
      const res = await supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      data = res.data as any[] | null;
      error = res.error as any;
      total = res.count ?? null;
    } else {
      const res = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      data = res.data as any[] | null;
      error = res.error as any;
      total = data ? data.length : 0;
    }

    if (error) {
      throw new Error(error.message);
    }

    const projects = data.map((project) => ({
      id: project.id,
      title: project.title,
      imageUrl: project.image_url,
      imageStoragePath: project.image_storage_path ?? null,
      caption: project.caption,
      aspectRatio: project.aspect_ratio,
      promptDetails: project.prompt_details,
      promptFull: project.prompt_full,
      type: project.type,
      userId: project.user_id,
      createdAt: project.created_at,
    }));

    if (limit) {
      const hasMore = typeof total === 'number' ? offset + projects.length < total : false;
      if (wantCounts) {
        const counts = await countCategories();
        return NextResponse.json({ items: projects, total, hasMore, limit, offset, counts });
      }
      return NextResponse.json({ items: projects, total, hasMore, limit, offset });
    }

    if (wantCounts) {
      const counts = await countCategories();
      return NextResponse.json({ items: projects, total, counts });
    }
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Gallery retrieval error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to retrieve gallery. ${errorMessage}` }, { status: 500 });
  }
}
