
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

var admin = require("firebase-admin");

// var serviceAccount = require("../habit-tracker-1685372449187-firebase-adminsdk-xwjlt-a5120de286.json");
import * as serviceAccount from "../habit-tracker-1685372449187-firebase-adminsdk-xwjlt-a5120de286.json";


const app = initializeApp({
  credential:admin.credential.cert(serviceAccount)
});

const auth = getAuth(app);
export default auth;