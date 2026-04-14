import type { GlossaryTerm } from '../../types'

export const passwordlessTerms: GlossaryTerm[] = [
  {
    id: 'auth-5',
    term: 'Passwordless Authentication',
    slug: 'passwordless',
    category: 'Authentication',
    definition:
      'Phương thức xác thực không cần password. User được verify qua magic links, OTPs, hoặc hardware keys (WebAuthn/FIDO2). Loại bỏ password-related vulnerabilities.',
    details:
      '**Passwordless Methods:**\n\n1. **Magic Links**\n   - Email/SMS link để login\n   - Token có expiration\n   - Không cần remember password\n\n2. **OTPs (One-Time Passwords)**\n   - Email/SMS codes\n   - Time-based (TOTP) hoặc Hash-based (HOTP)\n   - Limited validity period\n\n3. **WebAuthn / FIDO2**\n   - Public key cryptography\n   - Hardware keys (YubiKey) hoặc platform authenticators\n   - Phishing-resistant\n   - Biometric verification\n\n**Advantages:**\n- No password to leak/remember\n- Phishing-resistant (FIDO2)\n- Better UX\n- No password reset support needed\n\n**Challenges:**\n- Account recovery complexity\n- Device dependency\n- Initial setup friction',
    examples: [
      {
        title: 'Magic Link Implementation',
        code: `import { v4 as uuidv4 } from 'uuid';

// Generate và send magic link
app.post('/auth/passwordless/send', async (req, res) => {
  const { email } = req.body;

  // Generate token
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Store token
  await redis.set(\`magic_link:\${token}\`, JSON.stringify({
    email,
    createdAt: Date.now()
  }), 'EX', 900);

  // Send email
  const magicLink = \`https://myapp.com/auth/passwordless/verify?token=\${token}\`;
  await sendEmail({
    to: email,
    subject: 'Your Magic Link',
    html: \`<a href="\${magicLink}">Click here to sign in</a>\`
  });

  res.json({ message: 'Magic link sent' });
});

// Verify magic link
app.get('/auth/passwordless/verify', async (req, res) => {
  const { token } = req.query;

  const stored = await redis.get(\`magic_link:\${token}\`);
  if (!stored) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  const { email } = JSON.parse(stored);

  // Delete token (one-time use)
  await redis.del(\`magic_link:\${token}\`);

  // Find or create user
  let user = await db.users.findOne({ email });
  if (!user) {
    user = await db.users.create({ email });
  }

  // Generate session
  const sessionToken = jwt.sign({ sub: user.id }, JWT_SECRET);
  res.json({ token: sessionToken });
});`,
        explanation:
          'Magic links are tokens stored server-side with expiration. Token is invalidated after use. Email acts as the second factor (you need access to the email).',
      },
      {
        title: 'WebAuthn / FIDO2 Implementation',
        code: `import { generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse } from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

// Registration options
app.post('/webauthn/register-options', async (req, res) => {
  const user = await getUser(req.user.id);

  const options = await generateRegistrationOptions({
    rpName: 'MyApp',
    rpID: 'myapp.com',
    userID: user.id,
    userName: user.email,
    userDisplayName: user.name,
    attestationType: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'preferred',
      residentKey: 'preferred'
    }
  });

  // Save challenge
  await redis.set(\`webauthn_challenge:\${user.id}\`, options.challenge, 'EX', 600);

  res.json(options);
});

// Verify registration
app.post('/webauthn/register-verify', async (req, res) => {
  const { credential } = req.body;
  const user = await getUser(req.user.id);
  const expectedChallenge = await redis.get(\`webauthn_challenge:\${user.id}\`);

  const verification = await verifyRegistrationResponse({
    credential,
    expectedChallenge,
    expectedOrigin: 'https://myapp.com',
    expectedRPID: 'myapp.com'
  });

  if (verification.verified) {
    // Store credential
    await db.userWebAuthn.create({
      userId: user.id,
      credentialID: isoBase64URL.fromBuffer(verification.registrationInfo.credentialID),
      publicKey: verification.registrationInfo.publicKey,
      counter: verification.registrationInfo.counter
    });
  }

  res.json({ verified: verification.verified });
});

// Authentication options
app.post('/webauthn/auth-options', async (req, res) => {
  const credentials = await db.userWebAuthn.findMany({
    where: { userId: req.user.id }
  });

  const options = await generateAuthenticationOptions({
    rpID: 'myapp.com',
    allowCredentials: credentials.map(c => ({
      id: c.credentialID,
      type: 'public-key'
    })),
    userVerification: 'preferred'
  });

  await redis.set(\`webauthn_auth:\${req.user.id}\`, options.challenge, 'EX', 600);

  res.json(options);
});

// Verify authentication
app.post('/webauthn/auth-verify', async (req, res) => {
  const { credential } = req.body;
  const user = await getUser(req.user.id);
  const expectedChallenge = await redis.get(\`webauthn_auth:\${user.id}\`);

  const credentialRecord = await db.userWebAuthn.findOne({
    where: { credentialID: credential.id }
  });

  const verification = await verifyAuthenticationResponse({
    credential,
    expectedChallenge,
    expectedOrigin: 'https://myapp.com',
    expectedRPID: 'myapp.com',
    authenticator: {
      ...credentialRecord,
      credentialID: Buffer.from(credentialRecord.credentialID, 'base64')
    }
  });

  if (verification.verified) {
    await db.userWebAuthn.update({
      where: { id: credentialRecord.id },
      data: { counter: verification.authenticationInfo.newCounter }
    });
  }

  res.json({ verified: verification.verified });
});`,
        explanation:
          'WebAuthn uses asymmetric cryptography. Private key never leaves authenticator. Server stores public key. Phishing-resistant because credential is bound to RP ID.',
      },
    ],
    relatedTerms: ['Authentication', 'WebAuthn', 'FIDO2', 'MFA', 'Magic Link'],
    tags: ['passwordless', 'webauthn', 'fido2', 'authentication', 'security'],
  },
]
