import { Router } from "express";

import {
  createTask,
  getProjectTasks,
  updateTask
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  requireProjectAdmin,
  requireProjectMember
} from "../middleware/projectAccessMiddleware.js";

const router = Router();

router.use(protect);
router.get("/project/:projectId", requireProjectMember, getProjectTasks);
router.post("/", requireProjectAdmin, createTask);
router.put("/:id", updateTask);

export default router;
