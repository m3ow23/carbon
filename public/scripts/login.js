import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

import { initilizeFirebase } from "./firebase.js"
import { getFullHash } from "./hashing.js"
import { validateInputs } from "./utils.js";

// Initialize Firebase
initilizeFirebase()

// log in attempt
const auth = getAuth();
document.getElementById("logInButton").addEventListener("click", () => {
    const emailInput = document.getElementById('email')
    const passwordInput = document.getElementById('password')

    const email = emailInput.value
    const password = passwordInput.value

    if (validateInputs(email, password, emailInput, passwordInput)) {
        signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            getFullHash(password + auth.currentUser.uid)
            .then((fullHash) => {
                sessionStorage.setItem('carbonFullHash', fullHash);
                window.location.href = 'dashboard.html'
            }).catch(() => {
                alert('An Error Occured During Sign In!')
            });
        })
        .catch(() => {
            alert('Invalid Input!')
        });
    }
});