import { Request, Response, NextFunction } from 'express';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
const projectId = process.env.FIREBASE_PROJECT_ID || 'roadguard-512703';

if (!getApps().length) {
  try {
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('🔒 Firebase Admin SDK initialized with Service Account Credentials.');
    } else {
      // Automatic Application Default Credentials on Google Cloud Run
      initializeApp({ projectId });
      console.log(`🔒 Firebase Admin SDK initialized with Google Cloud Project: ${projectId}`);
    }
  } catch (err) {
    console.warn('⚠️ Firebase Admin SDK initialization fallback (Running in Demo Mode):', err);
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    role?: string;
  };
}

/**
 * Middleware to verify Firebase ID tokens or fallback to demo role headers
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  // 1. If Firebase Bearer token is provided, cryptographically verify it
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email,
        role: (decodedToken.role as string) || 'citizen',
      };
      return next();
    } catch (err: any) {
      console.warn('Firebase token verification failed:', err.message);
      return res.status(401).json({
        error: 'Unauthorized: Invalid or expired Firebase ID token.',
        details: err.message,
      });
    }
  }

  // 2. Allow Demo Mode requests for local hackathon testing
  const demoRole = req.headers['x-demo-role'] as string;
  if (demoRole || process.env.NODE_ENV !== 'production') {
    req.user = {
      uid: (req.headers['x-demo-user-id'] as string) || 'demo-user',
      email: (req.headers['x-demo-email'] as string) || 'demo@roadguard.local',
      name: (req.headers['x-demo-user-name'] as string) || 'Demo User',
      role: demoRole || 'citizen',
    };
    return next();
  }

  return res.status(401).json({
    error: 'Unauthorized: Authentication required. Provide a valid Firebase Bearer token.',
  });
}
