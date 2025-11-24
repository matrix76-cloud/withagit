import { useEffect, useState } from "react";

import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { ensureFirebase } from "services/firebase";

export default function useAuthUser() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ensureFirebase();
        const auth = getAuth();
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u || null);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const doSignOut = async () => {
        const auth = getAuth();
        await signOut(auth);
    };

    return { user, loading, signOut: doSignOut };
}
