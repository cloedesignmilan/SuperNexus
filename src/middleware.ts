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

    // Se l'autorizzazione fallisce o manca, chiediamo le credenziali nativamente.
    // Se l'utente clicca Annulla, il browser carica questo blocco di codice HTML
    // che effettua un redirect immediato alla pagina principale evitando la pagina bianca.
    const fallbackHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="refresh" content="0;url=/" />
        </head>
        <body>
          <script>window.location.href = "/";</script>
        </body>
      </html>
    `;

    return new NextResponse(fallbackHTML, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="SuperNexus Admin"',
        'Content-Type': 'text/html',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
