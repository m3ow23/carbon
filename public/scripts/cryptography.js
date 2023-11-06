import { getSingleHash } from "./hashing.js"

function encryptData(data, key) {
    data = key + data + key

    let dataCharacters = data.split('');
    let keyCharacters = key.split('')

    // convert keys to its ASCII values and get sum
    let keySum = 0
    for (const index in keyCharacters) {
        keyCharacters[index] = keyCharacters[index].charCodeAt(0)

        keySum += keyCharacters[index] 
    }
    keySum = keySum % 127

    let encryptedData = ''
    let keyCharactersIndex = 0
    for (const dataCharactersIndex in dataCharacters) {
        encryptedData += String.fromCharCode((dataCharacters[dataCharactersIndex].charCodeAt(0) + keySum + keyCharacters[keyCharactersIndex]) % 127)
        keyCharactersIndex++

        if (keyCharactersIndex == keyCharacters.length) {
            keyCharactersIndex = 0
        }
    }

    return encryptedData
}

function decryptData(encryptedData, key) {
    let dataCharacters = encryptedData.split('')
    let keyCharacters = key.split('')

    // convert keys to its ASCII values and get sum
    let keySum = 0
    for (const index in keyCharacters) {
        keyCharacters[index] = keyCharacters[index].charCodeAt(0)

        keySum += keyCharacters[index] 
    }
    keySum = keySum % 127

    let decryptedData = ''
    let keyCharactersIndex = 0
    for (const dataCharactersIndex in dataCharacters) {
        decryptedData += String.fromCharCode((dataCharacters[dataCharactersIndex].charCodeAt(0) - keySum - keyCharacters[keyCharactersIndex] + 254) % 127)
        keyCharactersIndex++

        if (keyCharactersIndex == keyCharacters.length) {
            keyCharactersIndex = 0
        }
    }

    return decryptedData.substring(key.length, decryptedData.length - key.length)
}

async function decryptAllData(encryptedData, fullHash) {
    const hashPromises = []
    for (const key in encryptedData) {
        const promise = getSingleHash(fullHash + key)
            .then(finalHash => {
                return {
                    [key]: {
                        accountName: decryptData(encryptedData[key]['accountName'], finalHash + 'accountName'),
                        password: encryptedData[key]['password'],
                        color: decryptData(encryptedData[key]['color'], finalHash  + 'color')
                    }
                }
            })
            .catch(() => {
                alert('An Error Occurred During Decryption!')
                console.log(error.message)
            });
        hashPromises.push(promise);
    }

    try {
        const results = await Promise.all(hashPromises)
        const decryptedData = results.reduce((acc, obj) => ({ ...acc, ...obj }), {});
        return decryptedData
    } catch(error) {
        alert('An Error Occurred During Decryption!');
        console.log(error.message)
    }
}

export { encryptData, decryptData, decryptAllData }