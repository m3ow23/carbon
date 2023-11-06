# Carbon

**Author:** Nathanael Memis

### Introduction:
Carbon is a password manager built for multi-device usage. Carbon is built using proper information security techniques which includes hashing, encryption, and authentication.
	
### Tech stack:
1. Backend: Firebase
2. Database: Firebase Realtime Database
3. Frontend: HTML, Javascript, & CSS

### Data Flow:
1. Authenticate using Email and Password.
2. Password is hashed 1000 times + user uid and returns the fullHash.
3. Firebase returns encrypted user data.
4. Each data is decrypted using the hash of the fullHash + uid of the data + type of data.
5. Frontend displays decrypted user data.

### Safety Protocols:
1. Each user is salted using their uid.
2. Each data is salted using the account uid + type of data.
3. Firebase only contains encrypted data. No data is identifiable in the database.
4. Encryption and Decryption is only done locally.
5. SHA-256 is used for hashing.
6. Custom algorithm is used for encryption/decryption. Data is padded by fullHash + data + fullHash. Sum of fullHash is added to each data character. A character from the fullHash is added to each data character sequentially.

### Database No SQL in JSON:

```
“user_uid” {
	“account_uid” {
		“accountName”: “encrypted_string”,
		“password”: “encrypted_string”
		“color”: “encrypted_string”
	},
	…
}
```