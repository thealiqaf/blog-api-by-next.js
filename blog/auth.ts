// /auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/app/lib/db"
import { hashPassword } from "@/app/lib/password"
import { getUserFromDb } from "@/app/utils/db"
import { ZodError } from "zod"
import { signInSchema } from "./app/lib/zod"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    GitHub,
    Credentials({
      credentials: {
        email: { type: "email", label: "Email", placeholder: "example@email.com" },
        password: { type: "password", label: "Password", placeholder: "*****" },
      },

      authorize: async (credentials) => {
        try {
          const { email, password } = await signInSchema.parseAsync(credentials);
          const pwHash = await hashPassword(password);
          const user = await getUserFromDb(email, pwHash);
          if (!user) throw new Error("Invalid credentials.");
          return user || null;
        } catch (error) {
          if (error instanceof ZodError) return null;
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login?error=true",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});