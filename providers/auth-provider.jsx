import { signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { auth } from "../FirebaseConfig";
import { AuthContext } from "../hooks/use-auth-context";

/**
 * Auth provider with Firebase authentication.
 * Listens to Firebase auth state changes and updates session accordingly.
 * Session exists → UI shows Home. When no session → UI shows Login.
 */
export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("[AuthProvider] onAuthStateChanged:", firebaseUser ? `signed in (${firebaseUser.email})` : "signed out");
      if (firebaseUser) {
        // Convert Firebase user to session format
        const sessionData = {
          user: {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            user_metadata: {
              full_name: firebaseUser.displayName || undefined,
              avatar_url: firebaseUser.photoURL || undefined,
            },
          },
        };
        setSession(sessionData);
      } else {
        setSession(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update profile when session changes
  useEffect(() => {
    if (session) {
      const profileData = {
        username: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
        full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
        avatar_url: session.user.user_metadata?.avatar_url || null,
        bio: "Hey – Welcome to Campus Social!",
      };
      setProfile(profileData);
    } else {
      setProfile(null);
    }
  }, [session]);

  // Sign out: use Firebase signOut, then clear local state so AuthGate shows Login immediately
  const signOut = useCallback(async () => {
    console.log("[AuthProvider] signOut() called");
    try {
      await firebaseSignOut(auth);
      console.log("[AuthProvider] firebaseSignOut(auth) completed, clearing session state");
      setSession(null);
      setProfile(null);
      console.log("[AuthProvider] session and profile set to null");
    } catch (error) {
      console.error("[AuthProvider] signOut error:", error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        profile,
        isLoggedIn: !!session,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
