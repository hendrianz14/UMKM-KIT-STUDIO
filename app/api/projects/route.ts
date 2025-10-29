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

export async function GET() {
  try {
    const supabase = await supabaseRoute();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Anda harus login untuk melihat galeri.' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

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

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Gallery retrieval error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to retrieve gallery. ${errorMessage}` }, { status: 500 });
  }
}
