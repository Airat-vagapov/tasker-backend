const express = require("express");
const { getAllTasks, addTask, getTaskById } = require("../controllers/taskController");

const taskRouter = express.Router();

taskRouter.get("/tasks", getAllTasks);
taskRouter.post("/task", addTask);
taskRouter.get("/task/:id", getTaskById);

module.exports = taskRouter;
