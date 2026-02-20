const taskModel = require('../models/task');

const getAllTasks = async (filters) => {
    // Обработка статусов
    let statusIds = null
    if (filters.status) {
        statusIds = filters.status
            .split(',')
            .map(id => parseInt(id.trim()))
            .filter(id => !isNaN(id))
    }

    // Обработка поиска
    const search = filters.search ? filters.search.trim().substring(0, 100) : null;
    const taskId = filters.task_id ? filters.task_id.trim().substring(0, 100) : null;
    const priority = filters.priority ? filters.priority.trim().substring(0, 100).toLowerCase() : null;
    const limit = Math.min(Math.max(Number(filters.limit) || 100, 1), 500);
    const page = Math.max(Number(filters.page) || 1, 1);
    const offset = (page - 1) * limit;
    const requestId = filters.requestId;

    // Обработка параметров сортировки 
    const allowedSortFields = {
        id: 't.id',
        title: 't.title',
        priority: 't.priority',
        status: 's.name',
        created_at: 't.created_at'
    };
    const sortField = allowedSortFields[filters.sortBy] || 't.id';

    // Параметр сортировки (по возр/по убыв)
    const sortOrder = ['asc', 'desc'].includes(filters.order?.toLowerCase())
        ? filters.order.toUpperCase()
        : 'DESC';


    return await taskModel.getTasks(statusIds, sortField, sortOrder, search, taskId, priority, limit, offset, requestId)
}

const addTask = async (data) => {
    if (!data || !data.title || data.title.trim() === '') {
        throw new Error('Task title is required')
    }
    if (!data || !data.priority || data.priority.trim() === '') {
        throw new Error('Task priority is required')
    }
    if (data.status_id !== undefined && data.status_id !== null) {
        const parsedStatusId = Number(data.status_id);
        if (!Number.isInteger(parsedStatusId) || parsedStatusId <= 0) {
            throw new Error('status_id must be a positive integer')
        }
        data.status_id = parsedStatusId;
    }
    return await taskModel.createTask(data)
}

const getTaskById = async (id) => {
    return await taskModel.getTask(id)
}

const updateTask = async (id, data) => {
    return await taskModel.updateTask(id, data)
}

const deleteTaskById = async (id) => {
    return await taskModel.deleteTaskById(id)
}

const getTaskByStatus = async (statuses) => {
    return await taskModel.getTasksByStatusId(statuses)
}

const getTaskStats = async () => {
    return await taskModel.getTaskStats()
}
module.exports = { getAllTasks, addTask, getTaskById, updateTask, deleteTaskById, getTaskByStatus, getTaskStats }
