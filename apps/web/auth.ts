import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { apiClient } from "./lib/apiClient";
import { decodeToken } from "./lib/jwt";
import { JWT } from "next-auth/jwt";
import { adminRole, payload } from "./types";
import { CustomAuthError } from "./lib/customAuthError";

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */

  interface User {
    accessToken: string;
  }

  interface Session {
    user: {
      role: adminRole;
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: {
    maxAge: 10 * 24 * 60 * 60, // 10 days
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { data, error } = await apiClient.post("/api/auth/login", {
          body: credentials,
        });
        if (error) throw new CustomAuthError(error);
        return { accessToken: data.accessToken };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      try {
        if (user) {
          const tokenData = await decodeToken(user.accessToken);
          token.accessToken = user.accessToken;
          token.exp = Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60;
        }
        if (trigger === "update") {
          token = { ...token, ...session.user };
        }

        // Check if token has expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (token.exp && currentTime > token.exp) {
          throw new Error("Token expired");
        }
        return token;
      } catch (error) {
        throw error; // Re-throw to be caught by session callback
      }
    },

    async session({ session, token }) {
      try {
        if (token?.accessToken) {
          const tokenData = await decodeToken<payload>(token.accessToken);
          session.user.accessToken = token.accessToken;
          session.user = {
            ...session.user,
            ...tokenData,
            name: session.user.name || tokenData.name,
          };
        }
        return session;
      } catch (error) {
        // Force sign out if token is invalid or expired
        return null;
      }
    },
  },
});
