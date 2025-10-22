import { redirect } from 'next/navigation';
import SignIn from '@/components/SignIn';
import { createSupabaseServerClientReadOnly } from '@/utils/supabase/server';

interface SignInPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const resolveRedirectTarget = (redirectParam?: string | string[]) => {
  if (!redirectParam) {
    return '/dashboard';
  }
  const target = Array.isArray(redirectParam) ? redirectParam[0] : redirectParam;
  return target && target.startsWith('/') ? target : '/dashboard';
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const supabase = await createSupabaseServerClientReadOnly();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const redirectTarget = resolveRedirectTarget(searchParams?.redirect);

  if (user) {
    redirect(redirectTarget);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-50 px-4 pt-28 pb-16">
      <SignIn redirectTo={redirectTarget} />
    </div>
  );
}
