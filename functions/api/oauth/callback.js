/**
 * OAuth Proxy untuk Sveltia CMS di Cloudflare Pages
 *
 * Endpoint: POST /api/oauth/callback
 *
 * Fungsi:
 *   - Menerima authorization code dari GitHub OAuth flow
 *   - Menukarkan code dengan access_token (server-side, dengan Client Secret)
 *   - Mengembalikan access_token ke CMS agar user bisa login
 *
 * Env vars yang harus di-set di Cloudflare Pages dashboard:
 *   - GITHUB_CLIENT_ID      : OAuth App Client ID
 *   - GITHUB_CLIENT_SECRET  : OAuth App Client Secret
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};

export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Hanya terima POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing code parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validasi env vars tersedia
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
      return new Response(JSON.stringify({
        error: 'OAuth credentials missing in Cloudflare env vars. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Pages dashboard.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Tukarkan code dengan access_token di server (RAHASIA tidak terekspos)
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'sveltia-cms-oauth-proxy'
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code: code
      })
    });

    const tokenData = await tokenResponse.json();

    // Log untuk debugging (tidak terekspos ke user)
    console.log('GitHub OAuth response:', JSON.stringify(tokenData));

    return new Response(JSON.stringify(tokenData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: err.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handler untuk GET (jika user akses langsung di browser, kembalikan instruksi)
export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    info: 'Sveltia CMS OAuth Proxy',
    usage: 'POST { code: string } to exchange GitHub authorization code for access token',
    docs: 'https://github.com/sveltia/sveltia-cms'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}