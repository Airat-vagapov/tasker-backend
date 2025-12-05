const taskModel = require('../models/task');

const getAllTasks = async () => {
    return await taskModel.getTasks()
}

const addTask = async (data) => {
    console.log('service', data)
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
