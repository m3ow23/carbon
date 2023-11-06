import { getDatabase, ref, onValue, push, update, child, set, remove } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js"
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

import { initilizeFirebase } from "./firebase.js"
import { validateInputs, rgbToHex, validateColor } from "./utils.js";
import { encryptData, decryptData, decryptAllData } from "./cryptography.js"
import { getSingleHash } from "./hashing.js"

import { AccountCard } from "../components/accountCard.js"

// Initialize Firebase
const app = initilizeFirebase()

// get Firebase database
const database = getDatabase(app);

// get fullHash from session storage
const fullHash = sessionStorage.getItem('carbonFullHash');

// global variable
let userUID = null
let accounts = null
let accountCurrentlyEditing = null
let pressTimer = null // for touch listener on mobile devices

// Check if the user is valid
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else if (!fullHash) {
        signOut(auth).then(() => {
            window.location.href = 'index.html'
        }).catch(() => {
            alert('An Error Occured While Logging Out!')
        });
    } else {
        userUID = user.uid

        // database listener
        const accountsRef = ref(database, userUID);
        onValue(accountsRef, (snapshot) => {
            accounts = snapshot.val()

            decryptAllData(accounts, fullHash)
                .then((decryptedAccounts) => {
                    accounts = decryptedAccounts
                    const accountsContainer = document.getElementById('accountsContainer')
                    accountsContainer.innerHTML = AccountCard(accounts, fullHash)

                    document.getElementById("addAccountCard").addEventListener("click", () => {
                        document.getElementById('addAccountModalContainer').style.visibility = 'visible'
                        document.getElementById('addAccountModalBackgroundBlur').style.visibility = 'visible'
                        document.getElementById('logoutContainer').style.visibility = 'hidden'

                        const addColorPicker = document.getElementById('addColorPicker')
                        addColorPicker.style.backgroundColor = "#ffffff"
                        addColorPicker.value = "#ffffff"
                    });

                    let accountUIDs = []
                    for (const key in accounts) {
                        accountUIDs.push(key)
                    }

                    const elements = document.querySelectorAll("#card")
                    elements.forEach((element, index) => {
                        const account = accounts[accountUIDs[index]]
                        const color = rgbToHex(element.style.backgroundColor)

                        // left click handler
                        element.addEventListener("click", () => {
                            getSingleHash(fullHash + accountUIDs[index])
                            .then((finalHash) => {
                                navigator.clipboard.writeText(decryptData(account['password'], finalHash  + 'password'))
                                .catch(error => {
                                    console.error('Unable to copy text to clipboard: ', error.message);
                                });
                                element.style.outline = '3px solid white'
                            })
                            .catch((error) => {
                                alert('An error occured while getting single hash!')
                                console.log(error.message)
                            })
                        })

                        // right click handler
                        element.addEventListener('contextmenu', (event) => {
                            event.preventDefault()

                            showEditModal(account, accountUIDs[index], color)
                        })

                        // For touch devices (e.g., mobile)
                        element.addEventListener("touchstart", () => {
                            pressTimer = setTimeout(() => showEditModal(account, accountUIDs[index], color), 1000); // 1000ms (1 second) as an example for long press duration
                        });
                        
                        // Clear the timeout if the touch is released before the long press duration
                        element.addEventListener("touchend", () => {
                            clearTimeout(pressTimer);
                        });

                        // hover handler
                        element.addEventListener("mouseover", () => {
                            element.style.backgroundColor = '#ffa500'
                        })
                        element.addEventListener("mouseout", () => {
                            element.style.backgroundColor = color
                            element.style.outline = ''
                        })
                    });
                })
                .catch((error) => {
                    alert('An Error Occurred During Decryption!')
                    console.log(error.message)
                })
        });

        document.getElementById("addButton").addEventListener("click", () => addAccount());
    }
});

function addAccount() {
    const accountNameInput = document.getElementById("addAccountName")
    const passwordInput = document.getElementById("addPassword")

    const accountName = accountNameInput.value
    const password = passwordInput.value
    const color = document.getElementById("addColorPicker").value

    if (validateInputs(accountName, password, accountNameInput, passwordInput)) {
        const newAccountUID = push(child(ref(database), userUID + '/')).key

        getSingleHash(fullHash + newAccountUID)
            .then((finalHash) => {
                const encryptedAccountName = encryptData(accountName, finalHash + 'accountName')
                const encryptedPassword = encryptData(password, finalHash + 'password')
                const encryptedColor = encryptData(color, finalHash + 'color')

                update(ref(database, userUID + '/' + newAccountUID), {
                    accountName: encryptedAccountName,
                    password: encryptedPassword,
                    color: encryptedColor
                })
                    .then(() => {
                        document.getElementById('addAccountModalContainer').style.visibility = 'hidden'
                        document.getElementById('addAccountModalBackgroundBlur').style.visibility = 'hidden'
                    })
                    .catch(() => {
                        alert('An Error Occured While Adding Account!')
                    });
            })
            .catch((error) => {
                alert('An Error Occured During Hashing!')
                console.log(error.message)
            });
    }
}

function editAccount() {
    const accountNameInput = document.getElementById("editAccountName")
    const passwordInput = document.getElementById("editPassword")

    const accountName = accountNameInput.value
    const password = passwordInput.value
    const color = document.getElementById('editColorPicker').value

    if (validateInputs(accountName, password, accountNameInput, passwordInput)) {
        getSingleHash(fullHash + accountCurrentlyEditing)
            .then((finalHash) => {
                const encryptedAccountName = encryptData(accountName, finalHash + 'accountName')
                const encryptedPassword = encryptData(password, finalHash + 'password')
                const encryptedColor = encryptData(color, finalHash + 'color')

                set(ref(database, '/' + userUID + '/' + accountCurrentlyEditing), {
                    accountName: encryptedAccountName,
                    password: encryptedPassword,
                    color: encryptedColor
                })
                    .then(() => {
                        document.getElementById('editAccountModalContainer').style.visibility = 'hidden'
                        document.getElementById('editAccountModalBackgroundBlur').style.visibility = 'hidden'
                    })
                    .catch(() => {
                        alert('An Error Occured While Adding Account!')
                    });
            })
            .catch((error) => {
                alert('An Error Occured During Hashing!')
                console.log(error.message)
            });
    }
}

function deleteAccount() {
    remove(ref(database, '/' + userUID + '/' + accountCurrentlyEditing))
        .then(() => {
            document.getElementById('editAccountModalContainer').style.visibility = 'hidden'
            document.getElementById('editAccountModalBackgroundBlur').style.visibility = 'hidden'
            document.getElementById('logoutContainer').style.visibility = 'visible'
        })
        .catch(() => {
            alert('An Error Occured While Deleting Account!')
        });
}

function showEditModal(account, accountUID, color) {
    document.getElementById('editAccountModalContainer').style.visibility = 'visible'
    document.getElementById('editAccountModalBackgroundBlur').style.visibility = 'visible'
    document.getElementById('logoutContainer').style.visibility = 'hidden'

    accountCurrentlyEditing = accountUID
    document.getElementById('accountUID').textContent = 'Editing ' + account['accountName']
    document.getElementById('editAccountName').value = account['accountName']
    document.getElementById('editPassword').value = account['password']

    const editColorPicker = document.getElementById('editColorPicker')
    editColorPicker.style.backgroundColor = color
    editColorPicker.value = color
}

// add modal listeners
document.getElementById("addAccountModalBackgroundBlur").addEventListener("click", () => {
    document.getElementById('addAccountModalContainer').style.visibility = 'hidden'
    document.getElementById('addAccountModalBackgroundBlur').style.visibility = 'hidden'
    document.getElementById('logoutContainer').style.visibility = 'visible'
});
document.getElementById("addCancelButton").addEventListener("click", () => {
    document.getElementById('addAccountModalContainer').style.visibility = 'hidden'
    document.getElementById('addAccountModalBackgroundBlur').style.visibility = 'hidden'
    document.getElementById('logoutContainer').style.visibility = 'visible'
});
const addColorPicker = document.getElementById('addColorPicker')
addColorPicker.addEventListener('input', () => {
    addColorPicker.style.backgroundColor = addColorPicker.value;
});

// edit modal listeners
document.getElementById("saveButton").addEventListener("click", () => editAccount());
document.getElementById("editAccountModalBackgroundBlur").addEventListener("click", () => {
    document.getElementById('editAccountModalContainer').style.visibility = 'hidden'
    document.getElementById('editAccountModalBackgroundBlur').style.visibility = 'hidden'
    document.getElementById('logoutContainer').style.visibility = 'visible'
});
document.getElementById("editCancelButton").addEventListener("click", () => {
    document.getElementById('editAccountModalContainer').style.visibility = 'hidden'
    document.getElementById('editAccountModalBackgroundBlur').style.visibility = 'hidden'
    document.getElementById('logoutContainer').style.visibility = 'visible'
});
document.getElementById("deleteButton").addEventListener("click", () => {
    deleteAccount()
    document.getElementById('editAccountModalContainer').style.visibility = 'hidden'
    document.getElementById('editAccountModalBackgroundBlur').style.visibility = 'hidden'
    document.getElementById('logoutContainer').style.visibility = 'visible'
});
const editColorPicker = document.getElementById('editColorPicker')
editColorPicker.addEventListener('input', () => {
    editColorPicker.style.backgroundColor = editColorPicker.value;
});

// log out button listener
document.getElementById("logoutButton").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = 'index.html'
        sessionStorage.removeItem('carbonFullHash')
    }).catch(() => {
        alert('An Error Occured While Logging Out!')
    });
});