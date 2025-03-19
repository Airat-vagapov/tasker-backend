const { getTasks, createTask } = require("../models/task");

const getAllTasks = async (req, res) => {
    try {
        const tasks = await getTasks();
        console.log(JSON.stringify(tasks.rows));
        res.status(200).json({ status: "200", result: tasks.rows });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

const addTask = async (req, res) => {
    console.log(`req is ${req}`);
    await createTask();
};

module.exports = { getAllTasks, addTask };
