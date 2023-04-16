import express = require("express");
import { getCurrentUserInfo, updateUser } from "./controllers";

const router = express.Router();

router.get("/me", getCurrentUserInfo);

router.put("/:id", updateUser);

export default router;
