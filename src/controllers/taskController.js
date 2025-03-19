const { getTasks, createTask } = require("../models/task");

const getAllTasks = async (req, res) => {
    try {
        const tasks = await getTasks();
        res.json(tasks.rows);
    } catch (err) {
        console.log(err);
        res.json({ message: err });
    }
};

const addTask = async (req, res) => {
    console.log(`req is ${req}`);
    await createTask();
};

module.exports = { getAllTasks, addTask };
