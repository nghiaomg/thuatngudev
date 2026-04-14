import type { GlossaryTerm } from '../../types'

export const oauthOidcTerms: GlossaryTerm[] = [
  {
    id: 'auth-4',
    term: 'OAuth 2.0 và OpenID Connect (OIDC)',
    slug: 'oauth-oidc',
    category: 'Authentication',
    definition:
      'OAuth 2.0 là authorization framework cho phép ứng dụng access resources của user từ một service khác. OIDC (OpenID Connect) thêm authentication layer trên OAuth 2.0 để xác minh identity.',
    details:
      '**OAuth 2.0 Grants/Flows:**\n\n1. **Authorization Code** (Recommended)\n   - Cho web apps, mobile apps\n   - Code exchange cho tokens\n\n2. **PKCE** (Proof Key for Code Exchange)\n   - Enhanced security cho public clients\n   - Bắt buộc cho mobile/spa\n\n3. **Client Credentials**\n   - Machine-to-machine\n   - Không có user context\n\n4. **Device Code**\n   - Cho devices without browser\n\n**OIDC 추가:**\n- ID Token (JWT) chứa user identity\n- UserInfo endpoint cho additional claims\n- Standard scopes: openid, profile, email\n\n**Key Differences:**\n- OAuth 2.0: "App X có quyền truy cập data của bạn không?"\n- OIDC: "Bạn là ai?"',
    examples: [
      {
        title: 'OAuth 2.0 Authorization Code Flow',
        code: `// 1. Redirect to Authorization Server
app.get('/auth/login/google', (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');
  const codeVerifier = crypto.randomBytes(32).toString('baseurl');

  // Lưu state và codeVerifier vào session/Redis
  redis.set(\`oauth_state:\${state}\`, JSON.stringify({
    codeVerifier,
    redirectUri: req.query.redirect_uri || '/'
  }), 'EX', 600);

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeVerifier);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  res.redirect(authUrl.toString());
});

// 2. Callback - Exchange code for tokens
app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;

  // Verify state
  const stored = await redis.get(\`oauth_state:\${state}\`);
  if (!stored) {
    return res.status(400).send('Invalid state');
  }
  const { codeVerifier, redirectUri } = JSON.parse(stored);

  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier
    })
  });

  const tokens = await tokenResponse.json();

  // Decode ID token (OIDC)
  const idToken = decodeJwt(tokens.id_token);
  console.log({
    sub: idToken.sub,      // Unique user ID
    email: idToken.email,
    name: idToken.name,
    picture: idToken.picture
  });

  // Create or update user
  const user = await findOrCreateOAuthUser({
    provider: 'google',
    providerId: idToken.sub,
    email: idToken.email,
    name: idToken.name
  });

  const appToken = jwt.sign({ sub: user.id }, JWT_SECRET, {
    expiresIn: '7d'
  });

  res.redirect(\`\${redirectUri}?token=\${appToken}\`);
});

// 3. Revoke tokens
app.post('/auth/logout', async (req, res) => {
  // Revoke provider token
  await fetch('https://oauth2.googleapis.com/revoke', {
    method: 'POST',
    body: new URLSearchParams({ token: req.user.providerToken })
  });

  // Clear local session
  res.json({ success: true });
});`,
        explanation:
          'Authorization Code + PKCE là best practice. State parameter prevents CSRF. codeVerifier proves the same client made the request. Luôn validate ID token signature.',
      },
    ],
    relatedTerms: ['Authentication', 'Authorization', 'JWT', 'PKCE', 'OAuth'],
    tags: ['oauth', 'oidc', 'oauth2', 'authentication', 'authorization', 'social-login'],
  },
]
