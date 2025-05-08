// /auth.ts
import NextAuth from "next-auth";
import { prisma } from "@/app/lib/db";
import { ZodError } from "zod";
import { signInSchema } from "./app/lib/zod";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

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
    
          const user = await prisma.user.findUnique({ where: { email } });
      
          if (!user || !user.hashedPassword)  throw new Error("email or password invalid");
      
          const isValid = await bcrypt.compare(password, user.hashedPassword);
          if (!isValid) throw new Error("Incorrect password");
      
          return user;
          
        } catch (error) {
          if (error instanceof ZodError){
            throw new Error("Invalid email or password format")
          } ;
          console.error("Authorization error:", error);
          throw new Error("Login failed: " + error);
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
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "USER";
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});