const express = require("express");
const { getAllTasks, addTask } = require("../controllers/taskController");

const taskRouter = express.Router();

taskRouter.get("/tasks", getAllTasks);
taskRouter.post("/task", addTask);

module.exports = taskRouter;
