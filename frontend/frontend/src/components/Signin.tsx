import React from "react";
import { auth } from  '../firebase'
import firebase from 'firebase/compat/app';

const Signin = () => {
    const handleGoogleSignIn = async () => {
        const provider = new firebase.auth.GoogleAuthProvider()
        try {
            const result = await auth.signInWithPopup(provider)
            const user = result.user
            console.log(user);            
        } catch (error) {
            console.log(error);
        }
    }

    return(
        <div>
            <button onClick={handleGoogleSignIn}>Sign in with Google</button>
        </div>
    )
}

export default Signin