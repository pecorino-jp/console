"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ルーター
 */
const express = require("express");
const authentication_1 = require("../middlewares/authentication");
const auth_1 = require("./auth");
const dashboard_1 = require("./dashboard");
const projects_1 = require("./projects");
const router = express.Router();
// middleware that is specific to this router
// router.use((req, res, next) => {
//   debug('Time: ', Date.now())
//   next()
// })
router.use(auth_1.default);
router.use(authentication_1.default);
router.use(dashboard_1.default);
router.use('/projects', projects_1.default);
exports.default = router;
