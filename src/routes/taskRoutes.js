const express = require("express");
const { getAllTasks, addTask, getTaskById, updateTaskData } = require("../controllers/taskController");

const taskRouter = express.Router();

taskRouter.get("/tasks", getAllTasks);
taskRouter.post("/task", addTask);
taskRouter.get("/task/:id", getTaskById);
taskRouter.post("/task/:id", updateTaskData);
module.exports = taskRouter;
