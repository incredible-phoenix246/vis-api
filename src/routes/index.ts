import express, { Router } from "express";
import { sayHelloController } from "../controllers";

const router: Router = express.Router();

router.get("/", sayHelloController);

module.exports = router;
