import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getStorage, type Bucket } from "firebase-admin/storage";

type FirebaseConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  storageBucket: string;
};

function readFirebaseConfig(): FirebaseConfig {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !rawPrivateKey || !storageBucket) {
    throw new Error(
      "Firebase environment variables are incomplete. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and FIREBASE_STORAGE_BUCKET."
    );
  }

  return {
    projectId,
    clientEmail,
    privateKey: rawPrivateKey.replace(/\\n/g, "\n"),
    storageBucket,
  };
}

let firebaseBucket: Bucket | null = null;

export function getFirebaseBucket(): Bucket {
  if (firebaseBucket) {
    return firebaseBucket;
  }

  const config = readFirebaseConfig();

  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          credential: cert({
            projectId: config.projectId,
            clientEmail: config.clientEmail,
            privateKey: config.privateKey,
          }),
          storageBucket: config.storageBucket,
        });

  firebaseBucket = getStorage(app).bucket();
  return firebaseBucket;
}
