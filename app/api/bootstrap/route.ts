
import { NextResponse } from 'next/server';

// This is a stand-in for a database call. Since we can't add a data.json file,
// we'll hardcode the initial data here.
const appData = {
    user: {
      name: "Budi Gunawan",
      email: "budi.gunawan@example.com",
      plan: "Pro",
      credits: 4350,
      expiryDate: "15 Agustus 2025"
    },
    dashboardStats: {
      weeklyWork: 12,
      totalCreditsUsed: 650
    },
    projects: [
      {
        id: 1,
        title: "Kopi Pagi Ceria",
        imageUrl: "/images/kopi_pagi.jpeg",
        caption: "Awali harimu dengan secangkir semangat! Kopi robusta pilihan dengan aroma yang menggugah selera. #KopiPagi #SemangatPagi #Robusta",
        aspectRatio: "4:5",
        promptDetails: "{Gaya: Dark & Moody}, {Pencahayaan: Natural Light}, {Komposisi: 45-Degree Angle}, {Suasana: Hangat}",
        type: "image"
      },
      {
        id: 2,
        title: "Es Teh Manis Segar",
        imageUrl: "/images/es_teh.jpeg",
        caption: "Siang terik? Segarkan kembali dengan Es Teh Manis kami! Manisnya pas, segarnya maksimal. ☀️ #EsTeh #MinumanSegar #PelepasDahaga",
        aspectRatio: "9:16",
        promptDetails: "{Gaya: Clean & Bright}, {Pencahayaan: Backlit}, {Komposisi: Human Element}, {Suasana: Menyegarkan}",
        type: "image"
      },
      {
        id: 3,
        title: "Burger Juicy Spesial",
        imageUrl: "/images/burger.jpeg",
        caption: "Gigitan pertama yang tak terlupakan! Patty juicy, sayuran segar, dan saus spesial kami. Lapar? Langsung serbu! 🍔 #BurgerLovers #MakanEnak #KulinerJakarta",
        aspectRatio: "1:1",
        promptDetails: "{Gaya: Food Porn}, {Pencahayaan: Hard Shadow}, {Komposisi: Close-up}, {Suasana: Lezat}",
        type: "image"
      }
    ],
    creditHistory: [
      { id: 1, type: "Top up", date: "2024-07-20", amount: 5000, transactionId: 12345 },
      { id: 2, type: "Image Generation", date: "2024-07-19", amount: -1, transactionId: 12346 },
      { id: 3, type: "Caption Generation", date: "2024-07-19", amount: -1, transactionId: 12347 },
      { id: 4, type: "Image Generation", date: "2024-07-18", amount: -1, transactionId: 12348 },
      { id: 5, type: "Image Generation", date: "2024-07-17", amount: -1, transactionId: 12349 }
    ]
  };

export async function GET(request: Request) {
  try {
    return NextResponse.json(appData);
  } catch (error) {
    console.error('Failed to bootstrap app data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
