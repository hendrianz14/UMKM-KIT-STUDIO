import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

type EncryptedPayload = {
  v: number;
  iv: string;
  tag: string;
  data: string;
};

const SUPPORTED_VERSION = 1;

function getSecretKey(): Buffer {
  const secret = process.env.USER_API_KEY_SECRET;
  if (!secret) {
    throw new Error('USER_API_KEY_SECRET is not configured');
  }
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptUserApiKey(rawKey: string): string {
  if (!rawKey) {
    throw new Error('API key must not be empty');
  }

  const key = getSecretKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(rawKey, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const payload: EncryptedPayload = {
    v: SUPPORTED_VERSION,
    iv: iv.toString('base64'),
    tag: authTag.toString('base64'),
    data: encrypted.toString('base64'),
  };

  return JSON.stringify(payload);
}

export function decryptUserApiKey(storedValue: string | null): string | null {
  if (!storedValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<EncryptedPayload>;
    if (typeof parsed !== 'object' || parsed === null || parsed.v !== SUPPORTED_VERSION) {
      // Treat as legacy plaintext storage.
      return storedValue;
    }

    if (!parsed.iv || !parsed.tag || !parsed.data) {
      throw new Error('Encrypted payload missing fields');
    }

    const key = getSecretKey();
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(parsed.iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(parsed.tag, 'base64'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(parsed.data, 'base64')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to decrypt user API key: ${error.message}`);
    }
    throw new Error('Failed to decrypt user API key');
  }
}

export function maskApiKey(rawKey: string | null): string | null {
  if (!rawKey) {
    return null;
  }

  const key = rawKey.trim();
  if (key.length === 0) {
    return null;
  }

  if (key.length <= 6) {
    return `${key.slice(0, Math.max(1, key.length - 1))}*`;
  }

  const prefix = key.slice(0, 4);
  const suffix = key.slice(-4);
  const maskedSectionLength = Math.max(6, key.length - 8);
  return `${prefix}${'*'.repeat(maskedSectionLength)}${suffix}`;
}

export type UserApiKeyInfo = {
  hasKey: boolean;
  masked: string | null;
  updatedAt: string | null;
  rawKey: string | null;
};

export async function fetchUserApiKey(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserApiKeyInfo> {
  const { data, error } = await supabase
    .from('user_api_keys')
    .select('api_key, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.api_key) {
    return {
      hasKey: false,
      masked: null,
      updatedAt: data?.updated_at ?? null,
      rawKey: null,
    };
  }

  const rawKey = decryptUserApiKey(data.api_key);
  const masked = maskApiKey(rawKey);

  return {
    hasKey: Boolean(rawKey),
    masked,
    updatedAt: data?.updated_at ?? null,
    rawKey,
  };
}
