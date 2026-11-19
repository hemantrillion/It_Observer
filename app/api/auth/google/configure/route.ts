import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export async function POST(req: Request) {
  try {
    const { clientId, clientSecret } = await req.json();

    if (!clientId || typeof clientId !== 'string' || !clientId.trim()) {
      return NextResponse.json(
        { success: false, error: 'Google Client ID is required.' },
        { status: 400 }
      );
    }

    const cleanClientId = clientId.trim();
    const cleanClientSecret = (clientSecret || '').trim();

    // Dynamically construct key name so Webpack's DefinePlugin will NOT attempt to inline/replace it
    const publicPropName = ['NEXT', 'PUBLIC', 'GOOGLE', 'CLIENT', 'ID'].join('_');

    const envMap: Record<string, string | undefined> = process.env;
    envMap['GOOGLE_CLIENT_ID'] = cleanClientId;
    envMap[publicPropName] = cleanClientId;
    if (cleanClientSecret) {
      envMap['GOOGLE_CLIENT_SECRET'] = cleanClientSecret;
    }

    // Persist to .env.local file
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const updateOrAppend = (content: string, key: string, value: string): string => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(content)) {
        return content.replace(regex, `${key}=${value}`);
      } else {
        return content ? `${content.trim()}\n${key}=${value}\n` : `${key}=${value}\n`;
      }
    };

    envContent = updateOrAppend(envContent, 'GOOGLE_CLIENT_ID', cleanClientId);
    envContent = updateOrAppend(envContent, publicPropName, cleanClientId);
    if (cleanClientSecret) {
      envContent = updateOrAppend(envContent, 'GOOGLE_CLIENT_SECRET', cleanClientSecret);
    }
    if (!envContent.includes('AUTH_SECRET=')) {
      envContent = updateOrAppend(envContent, 'AUTH_SECRET', 'infratrace_production_secure_auth_secret_token_key_2026');
    }
    if (!envContent.includes('NEXT_PUBLIC_APP_URL=')) {
      envContent = updateOrAppend(envContent, 'NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
    }

    fs.writeFileSync(envPath, envContent, 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Google OAuth credentials successfully saved and activated in .env.local',
      clientId: cleanClientId,
      hasSecret: Boolean(cleanClientSecret),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update credentials.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const envMap: Record<string, string | undefined> = process.env;
  const publicPropName = ['NEXT', 'PUBLIC', 'GOOGLE', 'CLIENT', 'ID'].join('_');
  const clientId = envMap['GOOGLE_CLIENT_ID'] || envMap[publicPropName] || '';
  const hasSecret = Boolean(envMap['GOOGLE_CLIENT_SECRET']);

  return NextResponse.json({
    configured: Boolean(clientId),
    clientId: clientId ? `${clientId.substring(0, 12)}...` : null,
    hasSecret,
  });
}
