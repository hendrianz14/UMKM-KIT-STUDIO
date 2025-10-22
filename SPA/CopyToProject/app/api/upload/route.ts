import { NextResponse } from 'next/server';
import { ref, getDownloadURL, uploadString } from 'firebase/storage';
import { storage } from '@/lib/firebaseClient'; // Impor storage dari Firebase Client

// Di produksi, endpoint ini harus dilindungi (misalnya, hanya untuk admin).
// Anda mungkin juga ingin menggunakan Signed URLs untuk unggahan yang lebih aman.
export async function POST(request: Request) {
  try {
    const { file, fileName } = await request.json(); // file dalam format base64
    
    if (!file || !fileName || !file.startsWith('data:image/')) {
      return NextResponse.json({ message: 'File (base64) and fileName are required' }, { status: 400 });
    }

    // Buat referensi ke lokasi penyimpanan di Firebase
    // Gunakan path yang unik untuk menghindari penimpaan file
    const storageRef = ref(storage, `product-images/${Date.now()}-${fileName}`);

    // Unggah file base64
    const snapshot = await uploadString(storageRef, file, 'data_url');
    
    // Dapatkan URL publik dari file yang diunggah
    const downloadURL = await getDownloadURL(snapshot.ref);

    return NextResponse.json({ url: downloadURL });
  } catch (error) {
    console.error('Firebase upload error:', error);
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  }
}