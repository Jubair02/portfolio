import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    /** `passwordChangedAt` as epoch ms, or 0 when never changed. */
    passwordChangedAt?: number;
  }
  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    /**
     * Password-change stamp, in epoch ms, frozen at sign-in.
     *
     * Deliberately not `iat`: Auth.js re-encodes the token on every session
     * read and `encode()` calls `setIssuedAt()` with no argument, so `iat`
     * moves forward constantly and can never be compared against anything.
     */
    pwc?: number;
  }
}
