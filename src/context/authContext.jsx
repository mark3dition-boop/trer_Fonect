import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Ambil profile jika session ada
    const fetchProfile = async (userEmail) => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", userEmail)
        .single();

      if (!error) {
        setProfile(data);
      }
    };


    // Ambil session awal
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);

    if (session?.user) {
      await fetchProfile(session.user.email);
    }

      setLoading(false);
    });


    // Listener auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.email);
      } else {
        setProfile(null);
      }
      
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, profile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);