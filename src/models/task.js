const { client } = require("../config/db");

const getTasks = async (statusIds, sortField, sortOrder, search, taskId, priority, limit, offset, requestId) => {
    const whereParts = []
    const values = []
    let idx = 1
    if (statusIds && statusIds.length) {
        whereParts.push(`t.status_id = ANY($${idx})`);
        values.push(statusIds);
        idx++;
    }

    if (search) {
        whereParts.push(`(t.title ILIKE $${idx} OR t.description ILIKE $${idx})`)
        values.push(`%${search}%`)
        idx++;
    }

    if (taskId) {
        whereParts.push(`(t.id) = $${idx}`);
        values.push(Number(taskId));
        idx++;
    }

    if (priority) {
        whereParts.push(`(t.priority) ILIKE $${idx}`);
        values.push(`%${priority}%`);
        idx++;
    }

    // Сбор условий для запроса
    const whereClause = whereParts.length
        ? `WHERE ${whereParts.join(' AND ')}`
        : '';

    values.push(limit);
    const limitParam = `$${idx}`;
    idx++;

    values.push(offset);
    const offsetParam = `$${idx}`;

    const query = `
    SELECT t.*, s.name as status
    FROM tasks t
    JOIN statuses s ON t.status_id = s.id
    ${whereClause}
    ORDER BY ${sortField} ${sortOrder}
    LIMIT ${limitParam}
    OFFSET ${offsetParam}
    `
    const sqlStartedAt = Date.now();
    console.log(`[${requestId || "tasks-no-id"}] DB getTasks query started`, { values });
    const res = await client.query(query, values);
    console.log(`[${requestId || "tasks-no-id"}] DB getTasks query completed in ${Date.now() - sqlStartedAt}ms`, { rowCount: res.rowCount });
    return res;
};

const createTask = async (task) => {
    let statusId = task.status_id ?? null;

    if (statusId === null || statusId === undefined) {
        await client.query(`
            INSERT INTO statuses (name)
            VALUES ('todo'), ('in_progress'), ('done')
            ON CONFLICT (name) DO NOTHING
        `);
        const defaultStatus = await client.query("SELECT id FROM statuses ORDER BY id ASC LIMIT 1");
        if (!defaultStatus.rows.length) {
            throw new Error("No statuses configured in database")
        }
        statusId = defaultStatus.rows[0].id;
    } else {
        const statusExists = await client.query("SELECT 1 FROM statuses WHERE id = $1 LIMIT 1", [statusId]);
        if (!statusExists.rows.length) {
            throw new Error(`Invalid status_id: ${statusId}`)
        }
    }

    const res = await client.query(
        "INSERT INTO tasks (title, description, priority, status_id) VALUES ($1,$2,$3,$4) RETURNING *",
        [task.title, task.description, task.priority, statusId]
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
    const res = await client.query(`DELETE FROM tasks WHERE id = $1 RETURNING *`, [id]);
    return res.rows[0];
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

const getTaskStats = async () => {
    const res = await client.query(`
       WITH counts AS (
            SELECT
                s.id   AS status_id,
                s.name AS status,
                COUNT(t.id)::int AS tasks_count
            FROM statuses s
            LEFT JOIN tasks t ON t.status_id = s.id
            GROUP BY s.id, s.name
            ORDER BY s.id
            ),
            oldest AS (
            SELECT
                t.id, t.title, t.priority, t.status_id, s.name AS status,
                t.created_at, t.updated_at
            FROM tasks t
            JOIN statuses s ON s.id = t.status_id
            ORDER BY t.created_at ASC
            LIMIT 1
            ),
            newest AS (
            SELECT
                t.id, t.title, t.priority, t.status_id, s.name AS status,
                t.created_at, t.updated_at
            FROM tasks t
            JOIN statuses s ON s.id = t.status_id
            ORDER BY t.created_at DESC
            LIMIT 1
            )
            SELECT
            (SELECT jsonb_agg(to_jsonb(counts)) FROM counts) AS counts_by_status,
            (SELECT to_jsonb(oldest) FROM oldest)           AS oldest_task,
            (SELECT to_jsonb(newest) FROM newest)           AS newest_task;
        `)

    return res.rows
}

module.exports = { getTasks, createTask, getTask, updateTask, deleteTaskById, getTasksByStatusId, getTaskStats };
