import React, { Suspense } from 'react';
import SignUp from '@/components/SignUp';

const SignInPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-50 px-4 pt-28 pb-16">
      <Suspense>
        <SignUp />
      </Suspense>
    </div>
  );
};

export default SignInPage;
