const taskModel = require('../models/task');

const getAllTasks = async (filters) => {
    console.log('status in service', filters.status)
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


    return await taskModel.getTasks(statusIds, sortField, sortOrder, search)
}

const addTask = async (data) => {
    if (!data || !data.title || data.title.trim() === '') {
        throw new Error('Task title is required')
    }
    if (!data || !data.priority || data.priority.trim() === '') {
        throw new Error('Task priority is required')
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
module.exports = { getAllTasks, addTask, getTaskById, updateTask, deleteTaskById, getTaskByStatus }
