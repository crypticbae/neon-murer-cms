const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

/**
 * JWT Token Authentifizierung Middleware
 * Verifiziert den Authorization Header und stellt User-Daten in req.user bereit
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access Token erforderlich',
      code: 'TOKEN_MISSING'
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
      
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({
          success: false,
          error: 'Ungültiger Token',
          code: 'TOKEN_INVALID'
        });
      }

      return res.status(403).json({
        success: false,
        error: 'Token-Verifizierung fehlgeschlagen',
        code: 'TOKEN_VERIFICATION_FAILED'
      });
    }

    // Token ist gültig, User-Daten in req.user speichern
    req.user = decoded;
    next();
  });
}

/**
 * Optional JWT Token Authentifizierung
 * Wenn Token vorhanden und gültig ist, wird req.user gesetzt
 * Wenn nicht, wird trotzdem fortgefahren (für öffentliche Endpoints mit optionaler Auth)
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = decoded;
    }
    next();
  });
}

/**
 * Rolle-basierte Autorisierung
 * Überprüft ob der authentifizierte User eine bestimmte Rolle hat
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentifizierung erforderlich',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Unzureichende Berechtigung',
        code: 'INSUFFICIENT_PERMISSION',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
}

/**
 * Admin-only Middleware
 * Kurze Variante für Admin-only Endpoints
 */
const requireAdmin = requireRole(['ADMIN']);

/**
 * Editor+ Middleware  
 * Admin oder Editor Berechtigung erforderlich
 */
const requireEditor = requireRole(['ADMIN', 'EDITOR']);

/**
 * Aktiven User aus Datenbank laden
 * Erweitert req.user um vollständige User-Daten aus der DB
 */
async function loadUser(req, res, next) {
  if (!req.user || !req.user.userId) {
    return next();
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Benutzer nicht gefunden oder deaktiviert',
        code: 'USER_INACTIVE'
      });
    }

    req.user.fullUser = user;
    next();
  } catch (error) {
    console.error('Load User Error:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Laden der Benutzerdaten',
      code: 'USER_LOAD_ERROR'
    });
  }
}

/**
 * Ownership Check
 * Überprüft ob der User der Eigentümer der Ressource ist oder Admin
 */
function requireOwnership(userIdField = 'createdBy') {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentifizierung erforderlich',
        code: 'AUTH_REQUIRED'
      });
    }

    // Admins haben immer Zugriff
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Überprüfe Ownership basierend auf dem übergebenen Parameter
    const resourceUserId = req.body[userIdField] || req.params[userIdField];
    
    if (resourceUserId && resourceUserId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Zugriff nur auf eigene Ressourcen erlaubt',
        code: 'OWNERSHIP_REQUIRED'
      });
    }

    next();
  };
}

/**
 * Kombinierte Auth + Role Middleware
 * Authentifizierung + Rollen-Check in einem
 */
function authWithRole(allowedRoles) {
  return [authenticateToken, requireRole(allowedRoles)];
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireEditor,
  loadUser,
  requireOwnership,
  authWithRole
}; 