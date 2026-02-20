const express = require("express");
const taskController = require("../controllers/taskController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const taskRouter = express.Router();

taskRouter.get("/tasks", authenticate, requireRole("user", "admin"), taskController.getTasks);
taskRouter.post("/task", authenticate, requireRole("admin"), taskController.addTask);
taskRouter.get("/task/:id", authenticate, requireRole("user", "admin"), taskController.getTaskById);
taskRouter.post("/task/:id", authenticate, requireRole("admin"), taskController.updateTaskData);
taskRouter.delete("/task/:id", authenticate, requireRole("admin"), taskController.deleteTask);
taskRouter.get("/tasks/status/", authenticate, requireRole("user", "admin"), taskController.getTaskByStatus);
taskRouter.get("/tasks/stats", authenticate, requireRole("user", "admin"), taskController.getTaskStats);

module.exports = taskRouter;
