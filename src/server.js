const { port } = require("./config/env");
const { connectDB } = require("./config/db");
const express = require("express");
const taskRouter = require("./routes/taskRoutes");
const cors = require('cors');

const { createTask } = require("./models/task");

async function startServer(app) {
    try {
        await connectDB();

        // Разрешить запросы с любого origin (для разработки)
        // app.use(cors());

        // Или разрешить только с конкретного origin
        app.use(
            cors({
                origin: "http://localhost:3000",
            })
        );

        app.use(express.json());

        app.use("/", taskRouter);

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (err) {
        console.error("Error connecting to PostgreSQL:", err);
        console.log(err);
        process.exit(1); // Завершаем процесс, если не удалось подключиться к базе данных
    }
}

module.exports = { startServer };
