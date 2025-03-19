const clients = require("../config/db");

const getTasks = async () => {
    const res = await clients.query("SELECT * FROM tasks");
    return res
};

const createTask = async (text) => {
    const res = await clients.query(
        "INSERT INTO tasks (text) VALUES ($1) RETURNING *",
        [text]
    );
    console.log(res);
    return res;
};

module.exports = { getTasks, createTask };
