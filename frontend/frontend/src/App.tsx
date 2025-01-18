import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import Signin from "./components/Signin";
import Chat from "./components/Chat";

interface User {
  displayName: string | null;
  email: string | null;
  uid: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Track authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // Map Firebase user to your User interface
        const mappedUser: User = {
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          uid: firebaseUser.uid,
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe(); // Clean up the listener
  }, []);

  return (
    <div>
      {/* Conditionally render Chat or Signin */}
      {user ? <Chat user={user} /> : <Signin />}
    </div>
  );
};

export default App;
