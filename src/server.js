const app = require("./app");
const { port } = require("./config/env");
const { connectDB } = require("./config/db");

async function startServer() {
    try {
        await connectDB();

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (err) {
        console.error("Error connecting to PostgreSQL:", err);
        console.log(err);
        process.exit(1); // Завершаем процесс, если не удалось подключиться к базе данных
    }
}

startServer();
