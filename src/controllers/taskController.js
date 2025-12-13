const taskService = require('../service/taskService')

const getTasks = async (req, res) => {
    try {
        // const { status, sortBy, order } = req.query
        // console.log(req.query)
        const filters = {
            status: req.query.status,
            sortBy: req.query.sortBy,
            order: req.query.order,
            search: req.query.search,
        }
        const tasks = await taskService.getAllTasks(filters);
        res.status(200).json({ status: "200", result: tasks.rows });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

const addTask = async (req, res) => {
    try {
        await taskService.addTask(req.body);
        res.status(200).json({ status: "200", result: "ok" });
    } catch (err) {
        if (err.message.includes('required')) {
            return res.status('400').json({ status: "400", message: err.message })
        }
        console.log(`Ошибка при запросе - ${err}`);
        res.status(500).json({ message: err });
    }
};

const getTaskById = async (req, res) => {
    try {
        const data = await taskService.getTaskById(req.params.id)
        res.status(200).json({ status: "200", result: data[0] });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: "500", message: err.message });
    }
}

const updateTaskData = async (req, res) => {
    try {
        const data = await taskService.updateTask(req.params.id, req.body.task);
        res.status(200).json({ status: "200", result: data });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: "500", message: err.message });
    }
}

const deleteTask = async (req, res) => {
    try {
        const data = await taskService.deleteTaskById(req.params.id);
        res.status(200).json({ status: "200", result: data });
    } catch (err) {
        console.log(err)
        res.status(500).json * ({ status: "500", message: err.message });
    }
}

const getTaskByStatus = async (req, res) => {
    try {
        if (!req.query.id) {
            return res.status(400).json({ status: "400", message: "Status ID is required" });
        }

        const statuses = req.query.id.split(',').map(id => parseInt(id.trim()))

        const data = await taskService.getTaskByStatus(statuses);
        console.log(data)
        res.status(200).json({ status: "200", result: data });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ status: "500", message: err.message });
    }
}

module.exports = { getTasks, addTask, getTaskById, updateTaskData, deleteTask, getTaskByStatus };
