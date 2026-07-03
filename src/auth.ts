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
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.password) {
            // For demo purposes, auto-register if doesn't exist
            const hashedPassword = await bcrypt.hash(credentials.password as string, 10);
            const newUser = await prisma.user.create({
                data: {
                    email: credentials.email as string,
                    password: hashedPassword,
                    name: (credentials.email as string).split('@')[0],
                    department: "Engineering"
                }
            });
            return newUser;
        }

        const passwordsMatch = await bcrypt.compare(credentials.password as string, user.password);
        if (passwordsMatch) return user;
        
        return null;
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
