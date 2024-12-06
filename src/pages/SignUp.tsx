import { SignUp as ClerkSignUp } from '@clerk/clerk-react';

export function SignUp() {
  return (
    <ClerkSignUp 
      appearance={{
        elements: {
          rootBox: 'mx-auto',
          card: 'shadow-none',
        },
      }}
      signInUrl="/sign-in"
    />
  );
}