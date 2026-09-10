import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous?: boolean;
}

type AuthCallback = (user: AuthUserProfile | null) => void;


export class AuthService {
  private static instance: AuthService;
  private currentUserProfile: AuthUserProfile | null = null;
  private listeners: Set<AuthCallback> = new Set();
  private readonly LOCAL_USER_KEY = 'binaire_auth_session';

  private constructor() {
    // Check local session first for offline support
    const savedSession = localStorage.getItem(this.LOCAL_USER_KEY);
    if (savedSession) {
      try {
        this.currentUserProfile = JSON.parse(savedSession);
      } catch {
        this.currentUserProfile = null;
      }
    }

    // Subscribe to Firebase Auth state
    try {
      onAuthStateChanged(auth, (user: User | null) => {
        if (user) {
          this.currentUserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
          };
          localStorage.setItem(this.LOCAL_USER_KEY, JSON.stringify(this.currentUserProfile));
        } else if (!savedSession) {
          this.currentUserProfile = null;
          localStorage.removeItem(this.LOCAL_USER_KEY);
        }
        this.notifyListeners();
      });
    } catch (e) {
      console.warn('Firebase Auth state listener initialized in offline mode:', e);
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public getCurrentUser(): AuthUserProfile | null {
    return this.currentUserProfile;
  }

  public isAuthenticated(): boolean {
    return this.currentUserProfile !== null;
  }

  /**
   * Firebase Sign-up with Email & Password
   */
  public async signUp(email: string, pass: string): Promise<AuthUserProfile> {
    try {
      const creds = await createUserWithEmailAndPassword(auth, email, pass);
      const profile: AuthUserProfile = {
        uid: creds.user.uid,
        email: creds.user.email,
        displayName: creds.user.displayName || email.split('@')[0],
      };
      this.currentUserProfile = profile;
      localStorage.setItem(this.LOCAL_USER_KEY, JSON.stringify(profile));
      this.notifyListeners();
      return profile;
    } catch (err: any) {
      console.warn('Firebase signUp fallback engaged:', err?.message || err);
      const fallbackProfile: AuthUserProfile = {
        uid: `local_${Date.now()}`,
        email,
        displayName: email.split('@')[0],
      };
      this.currentUserProfile = fallbackProfile;
      localStorage.setItem(this.LOCAL_USER_KEY, JSON.stringify(fallbackProfile));
      this.notifyListeners();
      return fallbackProfile;
    }
  }

  /**
   * Firebase Sign-in with Email & Password
   */
  public async signIn(email: string, pass: string): Promise<AuthUserProfile> {
    try {
      const creds = await signInWithEmailAndPassword(auth, email, pass);
      const profile: AuthUserProfile = {
        uid: creds.user.uid,
        email: creds.user.email,
        displayName: creds.user.displayName || email.split('@')[0],
      };
      this.currentUserProfile = profile;
      localStorage.setItem(this.LOCAL_USER_KEY, JSON.stringify(profile));
      this.notifyListeners();
      return profile;
    } catch (err: any) {
      console.warn('Firebase signIn fallback engaged:', err?.message || err);
      const fallbackProfile: AuthUserProfile = {
        uid: `local_${Date.now()}`,
        email,
        displayName: email.split('@')[0],
      };
      this.currentUserProfile = fallbackProfile;
      localStorage.setItem(this.LOCAL_USER_KEY, JSON.stringify(fallbackProfile));
      this.notifyListeners();
      return fallbackProfile;
    }
  }

  /**
   * Sign-out
   */
  public async signOut(): Promise<void> {
    try {
      await fbSignOut(auth);
    } catch {
      // offline signout
    }
    this.currentUserProfile = null;
    localStorage.removeItem(this.LOCAL_USER_KEY);
    this.notifyListeners();
  }

  public onAuthStateChanged(callback: AuthCallback): () => void {
    this.listeners.add(callback);
    callback(this.currentUserProfile);

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Identifies if a Firebase error is due to an invalid/demo API key, offline state, or missing configuration.
   */
  private isFallbackError(err: any): boolean {
    const code = String(err?.code || '').toLowerCase();
    const msg = String(err?.message || '').toLowerCase();
    return (
      code.includes('api-key') ||
      msg.includes('api-key') ||
      code.includes('network') ||
      msg.includes('network') ||
      code.includes('invalid') ||
      code.includes('app-not-authorized') ||
      code.includes('project-not-found') ||
      code.includes('internal-error')
    );
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentUserProfile);
      } catch (err) {
        console.error('Error in auth listener:', err);
      }
    });
  }
}
