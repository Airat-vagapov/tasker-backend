const { client } = require("../config/db");
const { search } = require("../routes/taskRoutes");

const getTasks = async (statusIds, sortField, sortOrder) => {
    const whereParts = []
    const values = []
    let idx = 1
    if (statusIds && statusIds.length) {
        whereParts.push(`t.status_id = ANY($${idx})`);
        values.push(statusIds);
        idx++;
    }

    if (search) {
        whereParts.push(`(t.title) ILIKE $${idx} AND t.description ILIKE $${idx})`)
        values.push(`%${search}%`)
        idx++;
    }

    // Сбор условий для запроса
    const whereClause = whereParts.length
        ? `WHERE ${whereParts.join(' AND ')}`
        : '';

    const query = `
    SELECT t.*, s.name as status
    FROM tasks t
    JOIN statuses s ON t.status_id = s.id
    ${whereClause}
    ORDER BY ${sortField} ${sortOrder}
    `

    const res = await client.query(query, values);
    return res;
};

const createTask = async (task) => {
    const res = await client.query(
        "INSERT INTO tasks (title, description, priority) VALUES ($1,$2,$3) RETURNING *",
        [task.title, task.description, task.priority]
    );
    return res;
};

const getTask = async (id) => {
    const res = await client.query(`
    SELECT t.*, s.name as status
    FROM tasks t
    JOIN statuses s ON t.status_id = s.id
    WHERE t.id = $1`,
        [id])
    return res.rows;
}

const updateTask = async (id, task) => {
    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(task)) {
        if (key === 'status') continue
        setClauses.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
    }
    await client.query(
        `
        UPDATE tasks
        SET ${setClauses.join(", ")}
        WHERE id = ${id}
        RETURNING *;
        `, values
    )
    return await getTask(id)
}

const deleteTaskById = async (id) => {
    const res = await client.query(`DELETE FROM tasks WHERE id = $1`, [id]);
    return res.rows;
}

const getTasksByStatusId = async (statusIds) => {
    const placeholders = statusIds.map((_, i) => `$${i + 1}`).join(',')

    const res = await client.query(`
    SELECT tasks.*, s.name as status 
    FROM tasks 
    JOIN statuses s ON tasks.status_id = s.id 
    WHERE tasks.status_id IN (${placeholders})
    ORDER BY tasks.id DESC
    `, statusIds);
    return res.rows;
}

module.exports = { getTasks, createTask, getTask, updateTask, deleteTaskById, getTasksByStatusId };
