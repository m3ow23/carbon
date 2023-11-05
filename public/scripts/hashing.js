// Function to hash a string using SHA-256
async function sha256Hash(message) {
    const msgBuffer = new TextEncoder().encode(message); // Convert the message to an ArrayBuffer

    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer); // Perform the hash

    // Convert the hash ArrayBuffer to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

async function getFullHash(input) {
    const iteration = 1000

    let hashedInput = input
    for (let i = 0; i < iteration; i++) {
        hashedInput = await sha256Hash(input + hashedInput);
    }

    return hashedInput
};

async function getSingleHash(input) {
    return await sha256Hash(input);
};

export { getFullHash, getSingleHash }