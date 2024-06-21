import { Router } from "express";

import ubiquitiRouter from "./ubiquiti.routes.js";

const router = Router();

router.use("/ubiquiti", ubiquitiRouter);

export default router;
