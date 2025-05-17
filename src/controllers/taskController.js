const { getTasks, createTask, getTask } = require("../models/task");

const getAllTasks = async (req, res) => {
    try {
        const tasks = await getTasks();
        res.status(200).json({ status: "200", result: tasks.rows });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

const addTask = async (req, res) => {
    if (req.body.text == "") {
        res.status(400).json({ status: "400", message: "Task text is empty" });
        return;
    }

    try {
        await createTask(req.body);
        res.status(200).json({ status: "200", result: "ok" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

const getTaskById = async (req, res) => {
    try {
        const data = await getTask(req.params.id)
        console.log(data[0])
        res.status(200).json({ status: "200", result: data[0] });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}

module.exports = { getAllTasks, addTask, getTaskById };
