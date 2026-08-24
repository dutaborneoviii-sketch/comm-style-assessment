import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { PrismaAdapter } from '@auth/prisma-adapter';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        npp: { label: "NPP", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log("Authorize called with credentials:", credentials);
          if (!credentials?.npp || !credentials?.password) return null;
          
          const user = await prisma.user.findUnique({
            where: { npp: credentials.npp as string }
          });
          
          console.log("User found:", user);

          if (!user || !user.password) {
              throw new Error("NPP atau password salah.");
          }

          if (user.status === 'PENDING') {
              throw new Error("Anda belum bisa login sebelum Administrator melakukan approval akses. Silahkan Menghubungi Administrator");
          }
          if (user.status === 'INACTIVE') {
              throw new Error("Hak akses user nonaktif. Silahkan menghubungi Administrator");
          }

          const passwordsMatch = await bcrypt.compare(credentials.password as string, user.password);
          if (passwordsMatch) return user;
          
          throw new Error("NPP atau password salah.");
        } catch (error) {
          console.error("Error in authorize:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
      ...authConfig.callbacks,
      async jwt({ token, user }) {
          if (user) {
              token.id = user.id;
          }
          return token;
      },
      async session({ session, token }) {
          if (token && session.user) {
              session.user.id = token.id as string;
          }
          return session;
      }
  }
});
