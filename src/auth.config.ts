import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = 
        nextUrl.pathname.startsWith('/profile') || 
        nextUrl.pathname.startsWith('/questionnaire') || 
        nextUrl.pathname.startsWith('/history') ||
        nextUrl.pathname.startsWith('/admin') ||
        nextUrl.pathname.startsWith('/team') ||
        nextUrl.pathname.startsWith('/guide');
        
      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && nextUrl.pathname === '/') {
        return Response.redirect(new URL('/profile', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
