import { Router } from "express";
import { authRouter } from "./auth.route";
import { organizationRouter } from "./organization.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/organizations", organizationRouter);

export default router;
