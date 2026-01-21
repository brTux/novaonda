import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth?.user;
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard') ||
        req.nextUrl.pathname.startsWith('/bots') ||
        req.nextUrl.pathname.startsWith('/chat') ||
        req.nextUrl.pathname.startsWith('/disparo') ||
        req.nextUrl.pathname.startsWith('/ferramentas') ||
        req.nextUrl.pathname.startsWith('/fluxos') ||
        req.nextUrl.pathname.startsWith('/settings') ||
        req.nextUrl.pathname === '/';

    if (isOnDashboard) {
        if (isLoggedIn) return; // Allow access
        return NextResponse.redirect(new URL('/login', req.nextUrl)); // Redirect to login without callbackUrl
    } else if (isLoggedIn && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }
    return;
});

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
