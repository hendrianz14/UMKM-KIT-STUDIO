import React from 'react';
import SignIn from '@/components/SignIn';

const SignInPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-50 px-4 pt-28 pb-16">
      <SignIn />
    </div>
  );
};

export default SignInPage;
