const { client } = require("../config/db");

const getTasks = async () => {
    const res = await client.query("SELECT * FROM tasks");
    return res;
};

const createTask = async (task) => {
    console.log(task)
    // const res = await client.query(
    //     "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
    //     [text]
    // );
    // console.log(res)
    // return res;
};

module.exports = { getTasks, createTask };
