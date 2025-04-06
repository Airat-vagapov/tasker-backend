const { client } = require("../config/db");

const getTasks = async () => {
    const res = await client.query("SELECT * FROM tasks");
    return res;
};

const createTask = async (text) => {
    const res = await client.query(
        "INSERT INTO tasks (name) VALUES ($1) RETURNING *",
        [text]
    );
    return res;
};

module.exports = { getTasks, createTask };
