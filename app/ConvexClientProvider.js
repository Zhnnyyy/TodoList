"use client";

import { SignIn, useAuth } from "@clerk/clerk-react";
import {
  Authenticated,
  AuthLoading,
  ConvexProvider,
  ConvexReactClient,
  Unauthenticated,
} from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { quantum } from "ldrs";
quantum.register();
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export function ConvexClientProvider({ children }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <Unauthenticated>
        <div className="h-[100vh] flex justify-center items-center">
          <SignIn />
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
