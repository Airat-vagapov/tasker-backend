const express = require("express");
const taskController = require("../controllers/taskController");

const taskRouter = express.Router();

taskRouter.get("/tasks", taskController.getTasks);
taskRouter.post("/task", taskController.addTask);
taskRouter.get("/task/:id", taskController.getTaskById);
taskRouter.post("/task/:id", taskController.updateTaskData);
taskRouter.delete("/task/:id", taskController.deleteTask)
taskRouter.get("/tasks/status/", taskController.getTaskByStatus);
taskRouter.get("/tasks/stats", taskController.getTaskStats)

module.exports = taskRouter;
