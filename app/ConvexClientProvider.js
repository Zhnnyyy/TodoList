"use client";

import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";

import {
  Authenticated,
  AuthLoading,
  ConvexProvider,
  ConvexReactClient,
  Unauthenticated,
} from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { quantum } from "ldrs";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
quantum.register();
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
export function ConvexClientProvider({ children }) {
  const path = usePathname();
  const [isSignIn, setIsSignIn] = useState(false);
  useEffect(() => {
    setIsSignIn(path.match("/sign-in"));
  }, [path]);
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <Unauthenticated>
        <div className="h-[100vh] flex justify-center items-center">
          {isSignIn && <SignIn />}
          {!isSignIn && <SignUp />}
        </div>
      </Unauthenticated>
      <Authenticated>{children}</Authenticated>
      <AuthLoading>
        <div className="h-[100vh] flex justify-center items-center">
          <l-quantum size="150" speed="1.75" color="black"></l-quantum>
        </div>
      </AuthLoading>
    </ConvexProviderWithClerk>
  );
}
