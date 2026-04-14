import type { GlossaryTerm } from '../../types'

export const mfaTerms: GlossaryTerm[] = [
  {
    id: 'auth-3',
    term: 'Multi-factor Authentication (MFA)',
    slug: 'mfa',
    category: 'Authentication',
    definition:
      'MFA yêu cầu nhiều hơn một phương pháp xác thực để verify identity của user. Kết hợp 2 hoặc 3 factors: something you know, something you have, something you are.',
    details:
      '**Three Factors of Authentication:**\n\n1. **Something you know** (Knowledge)\n   - Password\n   - PIN\n   - Security questions\n\n2. **Something you have** (Possession)\n   - Phone/SMS\n   - Authenticator app (TOTP)\n   - Hardware key (YubiKey)\n   - Smart card\n\n3. **Something you are** (Inherence)\n   - Fingerprint\n   - Face recognition\n   - Iris scan\n\n**Common MFA Methods:**\n- SMS/Voice OTP (not recommended - SIM swapping)\n- TOTP (Time-based One-Time Password)\n- HOTP (HMAC-based OTP)\n- Push notifications\n- Hardware security keys (FIDO2/WebAuthn)\n\n**MFA Bypass Methods:**\n- SIM swapping\n- Phishing via real-time relay\n- Credential stuffing',
    examples: [
      {
        title: 'TOTP Implementation',
        code: `import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Generate secret và QR code cho user setup
app.post('/mfa/setup', async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: 'MyApp:user@example.com',
    length: 20
  });

  // Lưu secret tạm thời (chưa active)
  await db.userMfa.create({
    userId: req.user.id,
    secret: secret.base32,
    status: 'pending'
  });

  // Tạo QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  res.json({
    secret: secret.base32, // Hiển thị cho user lưu backup
    qrCode: qrCodeUrl
  });
});

// Verify và activate MFA
app.post('/mfa/verify', async (req, res) => {
  const { token } = req.body;
  const mfa = await db.userMfa.findOne({
    userId: req.user.id,
    status: 'pending'
  });

  const verified = speakeasy.totp.verify({
    secret: mfa.secret,
    encoding: 'base32',
    token,
    window: 1 // Cho phép 1 step trước/sau
  });

  if (verified) {
    await db.userMfa.update({
      where: { id: mfa.id },
      data: { status: 'active' }
    });
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid token' });
  }
});

// Login với MFA
app.post('/mfa/login', async (req, res) => {
  const { email, password, mfaToken } = req.body;

  // Verify password trước
  const user = await verifyCredentials(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Kiểm tra user có MFA không
  const mfa = await db.userMfa.findOne({
    userId: user.id,
    status: 'active'
  });

  if (mfa && !mfaToken) {
    return res.status(403).json({
      error: 'MFA required',
      mfaRequired: true
    });
  }

  if (mfa) {
    const verified = speakeasy.totp.verify({
      secret: mfa.secret,
      encoding: 'base32',
      token: mfaToken
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid MFA token' });
    }
  }

  // Generate session
  const sessionToken = jwt.sign({ sub: user.id }, JWT_SECRET);
  res.json({ token: sessionToken });
});`,
        explanation:
          'TOTP uses time-based 6-digit codes that change every 30 seconds. Secret được share giữa server và authenticator app. Window cho phép clock skew.',
      },
    ],
    relatedTerms: ['Authentication', 'TOTP', 'WebAuthn', 'OAuth', 'Passwordless'],
    tags: ['mfa', '2fa', 'authentication', 'totp', 'security'],
  },
]
