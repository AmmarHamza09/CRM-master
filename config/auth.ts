import { AuthOptions, NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Adapter } from "next-auth/adapters";
import { compare } from "bcrypt";
import { db } from "@/prisma/db";

// Define custom user type to ensure consistency across providers
type CustomUser = {
  id: string;
  name: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  image: string | null;
  email: string | null;
  role: "USER" | "ADMIN";
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login page on error
  },
  providers: [
    GitHubProvider({
      profile(profile): CustomUser {
        const nameParts = (profile.name || profile.login || "").split(" ");
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          phone: "",
          image: profile.avatar_url,
          email: profile.email,
          role: "USER",
        };
      },
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      profile(profile): CustomUser {
        return {
          id: profile.sub,
          name: `${profile.given_name} ${profile.family_name}`,
          firstName: profile.given_name || "",
          lastName: profile.family_name || "",
          phone: "",
          image: profile.picture,
          email: profile.email,
          role: "USER",
        };
      },
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jb@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing credentials");
          }

          const existingUser = await db.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              phone: true,
              image: true,
              email: true,
              role: true,
              password: true,
            },
          });

          if (!existingUser || !existingUser.password) {
            throw new Error("No user found");
          }

          const passwordMatch = await compare(
            credentials.password,
            existingUser.password
          );

          if (!passwordMatch) {
            throw new Error("Invalid password");
          }

          return {
            id: existingUser.id,
            name: existingUser.name,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            phone: existingUser.phone || "",
            image: existingUser.image,
            email: existingUser.email,
            role: existingUser.role,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          picture: user.image,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture as string;
        session.user.role = token.role as "USER" | "ADMIN";
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },
  },
};