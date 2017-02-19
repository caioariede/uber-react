# uber-react
Uber-like project in React Native

# configuration

**File:** `.env`
Create a .env file with the following settings:

```
apiKey = "<firebase config>"
authDomain = "<firebase config>"
databaseURL = "<firebase config>"
storageBucket = "<firebase config>"
messagingSenderId = "<firebase config>"
mapBoxAccessToken = "<Access Token for MapBox Directions API>"
```

All these credentials you get from either Firebase or MapBox websites.

**File:** `fake_drivers/serviceAccountCredentials.json`

Get it from Firebase Service Accounts:

https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk
