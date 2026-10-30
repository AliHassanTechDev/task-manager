const http = require("http");
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "tasks.json");

const defaultTasks = [
    { id: 1, title: "Learn Node.js", completed: false },
    { id: 2, title: "Build my first project", completed: false }
];

function loadTasks() {
    try {
        return JSON.parse(fs.readFileSync(FILE, "utf8"));
    } catch (e) {
        return defaultTasks;
    }
}

function saveTasks() {
    fs.writeFileSync(FILE, JSON.stringify(tasks, null, 2));
}

let tasks = loadTasks();

const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    if (req.url === "/tasks" && req.method === "GET") {
        res.writeHead(200);
        res.end(JSON.stringify(tasks));
    }

    else if (req.url === "/tasks" && req.method === "POST") {
        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {
            const newTask = JSON.parse(body);

            const task = {
                id: tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
                title: newTask.title,
                completed: false
            };

            tasks.push(task);
            saveTasks();

            res.writeHead(201);
            res.end(JSON.stringify(task));
        });
    }

    else if (req.url.startsWith("/tasks/") && req.method === "PUT") {
        const id = Number(req.url.split("/")[2]);
        const task = tasks.find(t => t.id === id);

        if (!task) {
            res.writeHead(404);
            return res.end(JSON.stringify({ message: "Task not found" }));
        }

        task.completed = true;
        saveTasks();

        res.writeHead(200);
        res.end(JSON.stringify(task));
    }

    else if (req.url.startsWith("/tasks/") && req.method === "DELETE") {
        const id = Number(req.url.split("/")[2]);
        const index = tasks.findIndex(t => t.id === id);

        if (index === -1) {
            res.writeHead(404);
            return res.end(JSON.stringify({ message: "Task not found" }));
        }

        const removed = tasks.splice(index, 1)[0];
        saveTasks();

        res.writeHead(200);
        res.end(JSON.stringify(removed));
    }

    else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: "Route not found" }));
    }
});

server.listen(3000, () => {
    console.log("Task Manager API running at http://localhost:3000");
});
