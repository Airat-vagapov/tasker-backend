const express = require("express");
const client = require("./config/db");

const app = express();

app.get("/", (req, res) => {
    res.status(200);
    res.send("test my simple API");
});

async function startServer() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL');

        const result = await client.query("SELECT NOW()");
        console.log("Connected to PostgreSQL at:", result.rows[0].now);

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (err) {
        console.error("Error connecting to PostgreSQL:", err);
        console.log(err)
        process.exit(1); // Завершаем процесс, если не удалось подключиться к базе данных
    }
}

startServer();

module.exports = app;
