import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// const firebaseConfig = {
//   apiKey: "AIzaSyAThdl0c79qPws-mInoKHKzn7Y5MdG6ujE",
//   authDomain: "habit-tracker-1685372449187.firebaseapp.com",
//   projectId: "habit-tracker-1685372449187",
//   storageBucket: "habit-tracker-1685372449187.appspot.com",
//   messagingSenderId: "585549058906",
//   appId: "1:585549058906:web:91e18e5c4c3247ff159963",
//   measurementId: "G-3YJQT7ES0M"
// };

const app = initializeApp(firebaseConfig);

// gives us an auth instance
const auth = getAuth(app);

// in order to use this auth instance elsewhere
export default auth;
