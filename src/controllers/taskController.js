const { getTasks, createTask, getTask, updateTask, deleteTaskById, getTasksByStatusId } = require("../models/task");

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
        console.log(`Ошибка при запросе - ${err}`);
        res.status(500).json({ message: err });
    }
};

const getTaskById = async (req, res) => {
    try {
        const data = await getTask(req.params.id)
        res.status(200).json({ status: "200", result: data[0] });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: "500", message: err.message });
    }
}

const updateTaskData = async (req, res) => {
    try {
        const data = await updateTask(req.params.id, req.body.task);
        res.status(200).json({ status: "200", result: data });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: "500", message: err.message });
    }
}

const deleteTask = async (req, res) => {
    try {
        const data = await deleteTaskById(req.params.id);
        res.status(200).json({ status: "200", result: data });
    } catch (err) {
        console.log(err)
        res.status(500).json * ({ status: "500", message: err.message });
    }
}

const getTaskByStatus = async (req, res) => {
    console.log(`Получение задач со статусом ${req.params.statusId}`);
    try {
        const data = await getTasksByStatusId(req.params.statusId);
        console.log(data)
        res.status(200).json({ status: "200", result: data });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ status: "500", message: err.message });
    }

}

module.exports = { getAllTasks, addTask, getTaskById, updateTaskData, deleteTask, getTaskByStatus };
