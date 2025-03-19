const express = require("express");
const router = express.Router();
const { getAllTasks, addTask } = require("../controllers/taskController");

router.get("/tasks", getAllTasks);
router.post("/task", addTask);

module.exports = router;
