const express = require("express");
const { getAllTasks, addTask, getTaskById, updateTaskData, deleteTask, getTaskByStatus } = require("../controllers/taskController");

const taskRouter = express.Router();

taskRouter.get("/tasks", getAllTasks);
taskRouter.post("/task", addTask);
taskRouter.get("/task/:id", getTaskById);
taskRouter.post("/task/:id", updateTaskData);
taskRouter.delete("/task/:id", deleteTask)
taskRouter.get("/tasks/status/", getTaskByStatus);

module.exports = taskRouter;
