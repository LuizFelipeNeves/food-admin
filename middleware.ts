import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isPublicRoute = request.nextUrl.pathname.startsWith('/public');
  const isStoreRegisterRoute = request.nextUrl.pathname === '/store/register';
  const isStoreSelectRoute = request.nextUrl.pathname === '/store/select';
  
  // Rotas protegidas que exigem autenticação e loja selecionada
  const protectedRoutes = [
    '/',
    '/settings',
    '/products',
    '/orders',
    '/customers',
    '/analytics',
    '/pos',
    '/reports',
    '/profile',
    '/settings',
    '/devices',
    '/subscription',
    '/all-orders',
    '/store'
  ];

  // Rotas que exigem role de admin
  const adminRoutes = [
    '/settings/users',
    '/roadmap'
  ];
  
  // Permitir acesso às rotas públicas e API
  if (isPublicRoute || isApiRoute) {
    return NextResponse.next();
  }
  
  // Tratamento de rotas de autenticação
  if (isAuthRoute) {
    if (token && request.nextUrl.pathname !== '/auth/logout') {
      // Se estiver autenticado e não tiver loja selecionada, redireciona para seleção
      const hasSelectedStore = request.cookies.has('selectedStore');
      if (!hasSelectedStore) {
        return NextResponse.redirect(new URL('/store/select', request.url));
      }
      // Se tiver loja selecionada, redireciona para o dashboard
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Redirecionar para login se não estiver autenticado
  if (!token) {
    let callbackUrl = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      callbackUrl += request.nextUrl.search;
    }
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url)
    );
  }

  // Verificar permissões baseadas em role
  const userRole = token.role as string;
  const currentPath = request.nextUrl.pathname;

  // Verificar acesso a rotas de admin
  if (adminRoutes.some(route => currentPath.startsWith(route))) {
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Verificar se precisa de loja vinculada
  const needsStoreCheck = protectedRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(`${route}/`)
  );

  if (needsStoreCheck && !isStoreRegisterRoute && !isStoreSelectRoute) {
    const selectedStore = request.cookies.get('selectedStore');
    
    // Se não tiver loja selecionada, redireciona para seleção
    if (!selectedStore) {
      return NextResponse.redirect(new URL('/store/select', request.url));
    }

    const nextResponse = NextResponse.next();
    nextResponse.headers.set('x-store-id', selectedStore.value);
    return nextResponse;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets/).*)',
  ],
}; 