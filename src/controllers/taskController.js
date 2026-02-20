const taskService = require('../service/taskService')

const getTasks = async (req, res) => {
    const startedAt = Date.now();
    const requestId = `tasks-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[${requestId}] GET /tasks started`, { query: req.query });
    try {
        const filters = {
            status: req.query.status,
            sortBy: req.query.sortBy,
            priority: req.query.priority,
            order: req.query.order,
            search: req.query.search,
            task_id: req.query.task_id,
            page: req.query.page,
            limit: req.query.limit,
            requestId,
        }
        const tasks = await taskService.getAllTasks(filters);
        console.log(`[${requestId}] GET /tasks completed in ${Date.now() - startedAt}ms`, { rows: tasks.rowCount });
        res.status(200).json({ status: "200", result: tasks.rows });
    } catch (err) {
        const duration = Date.now() - startedAt;
        console.log(`[${requestId}] GET /tasks failed in ${duration}ms`, err);

        if (err.code === "ENOTFOUND") {
            return res.status(503).json({
                status: "503",
                message: "Database host is unreachable (DNS lookup failed)",
                code: err.code,
            });
        }

        if (err.code === "57014") {
            return res.status(504).json({
                status: "504",
                message: "Database query timeout",
                code: err.code,
            });
        }

        res.status(500).json({ message: err.message, code: err.code });
    }
};

const addTask = async (req, res) => {
    try {
        await taskService.addTask(req.body);
        res.status(200).json({ status: "200", result: "ok" });
    } catch (err) {
        if (
            err.message.includes('required') ||
            err.message.includes('status_id') ||
            err.message.includes('No statuses configured')
        ) {
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
        console.log(err);
        res.status(500).json({ status: "500", message: err.message });
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

const getTaskStats = async (req, res) => {
    try {
        const result = await taskService.getTaskStats();
        console.log(result);
        return res.status(200).json({ status: "200", data: result })
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: "500", message: err.message });
    }
}

module.exports = { getTasks, addTask, getTaskById, updateTaskData, deleteTask, getTaskByStatus, getTaskStats };
