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
  
  // Rotas protegidas que exigem autenticação
  const protectedRoutes = [
    '/', // Rota raiz agora é protegida
    '/settings',
    '/products',
    '/orders',
    '/customers',
    '/analytics',
    '/pos',
    '/reports',
    '/profile',
    '/settings',
    '/settings/users'
  ];
  
  // Rotas que exigem permissão de administrador
  const adminRoutes = [
    '/settings/users',
    '/reports/admin',
  ];
  
  // Rotas que exigem permissão de funcionário ou administrador
  const employeeRoutes = [
    '/pos',
    '/orders',
    '/all-orders',
    '/products',
  ];
  
  // Verificar se a rota atual é protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(`${route}/`)
  );
  
  // Verificar se a rota atual é exclusiva para admins
  const isAdminRoute = adminRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(`${route}/`)
  );
  
  // Verificar se a rota atual é exclusiva para funcionários ou admins
  const isEmployeeRoute = employeeRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(`${route}/`)
  );
  
  // Permitir acesso às rotas de API
  if (isApiRoute) {
    return NextResponse.next();
  }
  
  // Tratamento de rotas de autenticação
  if (isAuthRoute) {
    // Se já estiver autenticado e tentar acessar páginas de auth (exceto logout)
    if (token && request.nextUrl.pathname !== '/auth/logout') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }
  
  // Redirecionar para login se tentar acessar rota protegida sem autenticação
  if (isProtectedRoute && !token) {
    const callbackUrl = encodeURIComponent(request.nextUrl.pathname);
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }
  
  // Verificar permissão de admin
  if (isAdminRoute && token?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Verificar permissão de funcionário ou admin
  if (isEmployeeRoute && token?.role !== 'employee' && token?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Proteger todas as rotas exceto _next, public e favicon.ico
    '/((?!_next/static|_next/image|favicon.ico|public/|assets/).*)',
  ],
}; 