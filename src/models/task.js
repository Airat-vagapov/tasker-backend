const { client } = require("../config/db");

const getTasks = async () => {
    const res = await client.query("SELECT * FROM tasks");
    return res;
};

const createTask = async (task) => {
    console.log(task)
    const res = await client.query(
        "INSERT INTO tasks (title, description, priority) VALUES ($1,$2,$3) RETURNING *",
        [task.title, task.description, task.priority]
    );
    console.log(res)
    return res;
};

module.exports = { getTasks, createTask };
