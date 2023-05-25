import express = require("express");
import { getCurrentUserInfo, updateUser } from "./controllers";

const router = express.Router();

router.get("/me", getCurrentUserInfo);

router.patch("/:id", updateUser);

export default router;
