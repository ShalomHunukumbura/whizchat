import React, {useEffect, useState } from "react";
import { auth } from  '../firebase'

const AuthStatus: React.FC = () => {
    const [user, setUser] = useState<any>(null)

    useEffect(()=>{
        const unsubscribe = auth.onAuthStateChanged(setUser)
        return () => unsubscribe()
    },[])

    if (user) {
        return <div>Welcome, {user.displayName}</div>
    } else {
        return <div>Please Signin</div>
    }

   
}

export default AuthStatus