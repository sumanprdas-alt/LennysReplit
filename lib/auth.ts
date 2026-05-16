import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getOne, query } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        isSignUp: { label: "Sign Up", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        if (credentials.isSignUp === "true") {
          // Sign up
          const existing = await getOne(
            "SELECT id FROM users WHERE email = $1",
            [credentials.email]
          );
          if (existing) throw new Error("Email already registered");

          const hash = await bcrypt.hash(credentials.password, 10);
          const result = await query(
            "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name",
            [credentials.email, hash, credentials.name || ""]
          );
          const user = result.rows[0];
          return { id: String(user.id), email: user.email, name: user.name };
        } else {
          // Sign in
          const user = await getOne(
            "SELECT id, email, name, password_hash, onboarding_complete FROM users WHERE email = $1",
            [credentials.email]
          );
          if (!user) throw new Error("No account found");

          const valid = await bcrypt.compare(credentials.password, user.password_hash);
          if (!valid) throw new Error("Invalid password");

          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            onboardingComplete: user.onboarding_complete,
          };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
