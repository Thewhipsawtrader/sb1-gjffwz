import { SignIn as ClerkSignIn } from '@clerk/clerk-react';

export function SignIn() {
  return (
    <ClerkSignIn 
      appearance={{
        elements: {
          rootBox: 'mx-auto',
          card: 'shadow-none',
        },
      }}
      signUpUrl="/sign-up"
    />
  );
}