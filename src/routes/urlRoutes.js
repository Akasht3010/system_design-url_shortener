const express = require("express");
const router = express.Router();

const controller = require("../controllers/urlController");

router.post("/shorten", controller.shorten);
router.get("/:code", controller.redirect);
router.get("/analytics/:code", getAnalytics);

module.exports = router;