import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Proteggiamo solo le rotte sotto /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = req.headers.get('authorization');

    // Recuperiamo user e pass dalle variabili d'ambiente (o impostiamo un default)
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'supernexus2026';

    if (authHeader) {
      const authValue = authHeader.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      if (user === adminUser && pwd === adminPass) {
        return NextResponse.next();
      }
    }

    // Se l'autorizzazione fallisce o manca, chiediamo le credenziali nativamente
    return new NextResponse('Autenticazione Richiesta', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="SuperNexus Admin"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
