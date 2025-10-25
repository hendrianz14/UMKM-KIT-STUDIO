import { NextResponse } from 'next/server';
import { createSupabaseServerClientWritable } from '@/utils/supabase/server'; // Secure, writable client

// Force the route to run on the Node.js runtime for compatibility and stability.
export const runtime = 'nodejs';

export async function POST(request: Request) {
  // Use the action client which is designed for writable operations (auth, session refresh)
  const supabase = await createSupabaseServerClientWritable();

  // 1. Securely get the user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // If no user is authenticated, deny access immediately.
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Validate request body
  const { amount, generationId } = await request.json();

  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Invalid or missing amount' }, { status: 400 });
  }

  if (!generationId) {
    return NextResponse.json({ error: 'Missing generationId' }, { status: 400 });
  }

  try {
    // 3. Call the database function using the AUTHENTICATED client.
    // This is the critical security change: we are no longer using the admin client.
    // The database function must be designed to use the caller's UID (auth.uid()).
    const { data, error } = await supabase.rpc('deduct_credits_and_log', {
      p_amount: amount,
      p_reason: 'IMAGE_GENERATION', // This will be correctly cast by Postgres
      p_generation_id: generationId,
      p_user_id: user.id,
    });

    if (error) {
      console.error('Database RPC Error:', error);
      // Check for a specific error message from a CHECK constraint or RAISE EXCEPTION
      if (error.message.includes('insufficient credits')) {
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 }); // 402 Payment Required is more semantic
      }
      return NextResponse.json({ error: 'A database error occurred.' }, { status: 500 });
    }

    // 4. Process the result from the RPC
    // Assuming the function returns a single record upon success
    const result = Array.isArray(data) ? data[0] : data;

    if (!result || !result.success) {
      // This handles cases where the function runs but reports failure (e.g., custom logic)
      return NextResponse.json(
        { error: result?.message || 'Transaction was not successful.', current_balance: result?.new_balance },
        { status: 400 } // Bad Request, as the operation was logically invalid
      );
    }

    // 5. Format and return the successful response
    const reason: string = String(result.ledger_reason || '');
    const reasonKey = reason.toLowerCase();
    const typeLabel =
      reasonKey === 'image_generation' || reasonKey === 'image' || reasonKey === 'generate_image'
        ? 'Generate Gambar'
        : reasonKey === 'caption_generation' || reasonKey === 'caption' || reasonKey === 'generate_caption'
        ? 'Generate Caption'
        : 'Penggunaan Kredit';

    const newHistoryItem = {
      id: result.ledger_id,
      type: typeLabel,
      date: result.ledger_created_at,
      amount: -amount,
      transactionId: result.ledger_transaction_no,
    };

    return NextResponse.json({
      message: 'Credits successfully deducted.',
      newCredits: result.new_balance,
      newHistoryItem,
    });

  } catch (err) {
    // Catch-all for unexpected errors (e.g., network issues, JSON parsing failures)
    console.error('Critical API Route Error:', err);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
