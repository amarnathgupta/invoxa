import { Router } from "express";
import { authRouter } from "./auth.route";
import { organizationRouter } from "./organization.route";
import clientRouter from "./client.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/organizations", organizationRouter);
router.use("/clients", clientRouter);

export default router;
