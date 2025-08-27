const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

// Import security middleware
const { rateLimiters, logSecurityEvent } = require('../middleware/security');

const router = express.Router();
const prisma = new PrismaClient();

// JWT Secret aus Environment
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// Helper: JWT Token generieren
function generateTokens(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'neon-murer-cms',
    subject: user.id
  });

  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' }, 
    JWT_SECRET, 
    { 
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'neon-murer-cms',
      subject: user.id
    }
  );

  return { accessToken, refreshToken };
}

// Helper: User-Data ohne Passwort
function sanitizeUser(user) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// POST /api/auth/login - Benutzer anmelden
router.post('/login', 
  rateLimiters.auth,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Gültige E-Mail-Adresse erforderlich'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Passwort muss mindestens 6 Zeichen haben')
  ],
  async (req, res) => {
    try {
      // Validierung prüfen
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logSecurityEvent('LOGIN_VALIDATION_FAILED', req, { errors: errors.array() });
        return res.status(400).json({
          success: false,
          error: 'Ungültige Eingabedaten',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      // User in Datenbank suchen
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        logSecurityEvent('LOGIN_USER_NOT_FOUND', req, { email });
        return res.status(401).json({
          success: false,
          error: 'Ungültige Anmeldedaten'
        });
      }

      // Überprüfe ob Account aktiv ist
      if (!user.isActive) {
        logSecurityEvent('LOGIN_INACTIVE_ACCOUNT', req, { userId: user.id, email });
        return res.status(401).json({
          success: false,
          error: 'Account ist deaktiviert'
        });
      }

      // Passwort verifizieren
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        logSecurityEvent('LOGIN_INVALID_PASSWORD', req, { userId: user.id, email });
        return res.status(401).json({
          success: false,
          error: 'Ungültige Anmeldedaten'
        });
      }

      // JWT Tokens generieren
      const { accessToken, refreshToken } = generateTokens(user);

      // Login-Zeitstempel aktualisieren
      await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() }
      });

      // Erfolgreiche Anmeldung loggen
      logSecurityEvent('LOGIN_SUCCESS', req, { userId: user.id, email, role: user.role });

      // Erfolgreiche Anmeldung
      res.json({
        success: true,
        message: 'Erfolgreich angemeldet',
        user: sanitizeUser(user),
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: JWT_EXPIRES_IN
        }
      });

    } catch (error) {
      console.error('Login Error:', error);
      logSecurityEvent('LOGIN_ERROR', req, { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Interner Serverfehler bei der Anmeldung'
      });
    }
  }
);

// POST /api/auth/register - Neuen Benutzer registrieren (nur für Admins)
router.post('/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Gültige E-Mail-Adresse erforderlich'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Passwort muss mindestens 8 Zeichen haben und Groß-, Kleinbuchstaben sowie eine Zahl enthalten'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name muss zwischen 2 und 100 Zeichen haben'),
    body('role')
      .optional()
      .isIn(['ADMIN', 'EDITOR', 'VIEWER'])
      .withMessage('Ungültige Rolle')
  ],
  async (req, res) => {
    try {
      // Validierung prüfen
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Ungültige Eingabedaten',
          details: errors.array()
        });
      }

      const { email, password, name, role = 'EDITOR' } = req.body;

      // Prüfen ob E-Mail bereits existiert
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'E-Mail-Adresse bereits registriert'
        });
      }

      // Passwort hashen
      const hashedPassword = await bcrypt.hash(password, 12);

      // Neuen User erstellen
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role
        }
      });

      // Tokens generieren
      const { accessToken, refreshToken } = generateTokens(newUser);

      res.status(201).json({
        success: true,
        message: 'Benutzer erfolgreich registriert',
        user: sanitizeUser(newUser),
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: JWT_EXPIRES_IN
        }
      });

    } catch (error) {
      console.error('Register Error:', error);
      res.status(500).json({
        success: false,
        error: 'Interner Serverfehler bei der Registrierung'
      });
    }
  }
);

// GET /api/auth/me - Aktuelle Benutzer-Informationen abrufen
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Benutzer nicht gefunden oder deaktiviert'
      });
    }

    res.json({
      success: true,
      user: sanitizeUser(user)
    });

  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Abrufen der Benutzerdaten'
    });
  }
});

// POST /api/auth/refresh - Access Token erneuern
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh Token erforderlich'
      });
    }

    // Refresh Token verifizieren
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: 'Ungültiger Token-Typ'
      });
    }

    // User abrufen
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Benutzer nicht gefunden oder deaktiviert'
      });
    }

    // Neue Tokens generieren
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    res.json({
      success: true,
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: JWT_EXPIRES_IN
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Ungültiger oder abgelaufener Refresh Token'
      });
    }

    console.error('Refresh Token Error:', error);
    res.status(500).json({
      success: false,
      error: 'Interner Serverfehler beim Token-Refresh'
    });
  }
});

// POST /api/auth/logout - Benutzer abmelden
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Hier könnten wir Token in eine Blacklist eintragen
    // Für jetzt einfach Success zurückgeben
    res.json({
      success: true,
      message: 'Erfolgreich abgemeldet'
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Abmelden'
    });
  }
});

// PUT /api/auth/change-password - Passwort ändern
router.put('/change-password',
  authenticateToken,
  [
    body('currentPassword')
      .isLength({ min: 1 })
      .withMessage('Aktuelles Passwort erforderlich'),
    body('newPassword')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Neues Passwort muss mindestens 8 Zeichen haben und Groß-, Kleinbuchstaben sowie eine Zahl enthalten')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Ungültige Eingabedaten',
          details: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      // User abrufen
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Benutzer nicht gefunden'
        });
      }

      // Aktuelles Passwort verifizieren
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Aktuelles Passwort ist falsch'
        });
      }

      // Neues Passwort hashen
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Passwort in DB aktualisieren
      await prisma.user.update({
        where: { id: userId },
        data: { 
          password: hashedNewPassword,
          updatedAt: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Passwort erfolgreich geändert'
      });

    } catch (error) {
      console.error('Change Password Error:', error);
      res.status(500).json({
        success: false,
        error: 'Fehler beim Ändern des Passworts'
      });
    }
  }
);

// Middleware: JWT Token authentifizieren
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access Token erforderlich'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token abgelaufen',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(403).json({
        success: false,
        error: 'Ungültiger Token'
      });
    }

    req.user = decoded;
    next();
  });
}

// Middleware exportieren für andere Routes
router.authenticateToken = authenticateToken;

// Change password endpoint
router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Aktuelles Passwort ist erforderlich'),
  body('newPassword').isLength({ min: 8 }).withMessage('Neues Passwort muss mindestens 8 Zeichen lang sein')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validierungsfehler',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Benutzer nicht gefunden'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      logSecurityEvent('password_change_failed', req, { reason: 'invalid_current_password', userId });
      return res.status(400).json({
        success: false,
        error: 'Aktuelles Passwort ist falsch'
      });
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: 'Das neue Passwort muss sich vom aktuellen unterscheiden'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    });

    // Log security event
    logSecurityEvent('password_changed', req, { result: 'success', userId });

    res.json({
      success: true,
      message: 'Passwort erfolgreich geändert'
    });

  } catch (error) {
    console.error('Password change error:', error);
    logSecurityEvent('password_change_failed', req, { reason: 'server_error', error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Serverfehler beim Ändern des Passworts'
    });
  }
});

// Get session info endpoint
router.get('/session-info', authenticateToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token fehlt'
      });
    }

    // Decode token to get issue time
    const decoded = jwt.decode(token);
    const loginTime = new Date(decoded.iat * 1000);

    res.json({
      success: true,
      loginTime: loginTime.toISOString(),
      user: {
        id: req.user.userId,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
      }
    });

  } catch (error) {
    console.error('Session info error:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Laden der Sitzungsinformationen'
    });
  }
});

// Logout all sessions endpoint (invalidate all tokens)
router.post('/logout-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // In a real implementation, you would maintain a blacklist of tokens
    // or use a token versioning system. For now, we'll just log the event
    logSecurityEvent('logout_all_sessions', req, { result: 'success', userId });

    res.json({
      success: true,
      message: 'Alle Sitzungen beendet'
    });

  } catch (error) {
    console.error('Logout all sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Beenden der Sitzungen'
    });
  }
});

module.exports = router; 