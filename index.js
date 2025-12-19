const express = require("express");
const app = express();

app.use(express.json());

let tasks = [];
let idCounter = 1;

/* ---------------- CREATE TASK ---------------- */
app.post("/tasks", (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const task = {
    id: idCounter++,
    title,
    completed: false,
    createdAt: new Date()
  };

  tasks.push(task);
  res.status(201).json(task);
});

/* ---------------- GET ALL TASKS ---------------- */
app.get("/tasks", (req, res) => {
  const { status } = req.query;

  if (status === "completed") {
    return res.json(tasks.filter(t => t.completed));
  }

  if (status === "pending") {
    return res.json(tasks.filter(t => !t.completed));
  }

  res.json(tasks);
});

/* ---------------- UPDATE TASK ---------------- */
app.put("/tasks/:id", (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  task.title = req.body.title ?? task.title;
  res.json(task);
});

/* ---------------- TOGGLE COMPLETE ---------------- */
app.patch("/tasks/:id/complete", (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  task.completed = !task.completed;
  res.json(task);
});

/* ---------------- DELETE TASK ---------------- */
app.delete("/tasks/:id", (req, res) => {
  const index = tasks.findIndex(t => t.id == req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Task not found" });
  }

  tasks.splice(index, 1);
  res.json({ message: "Task deleted successfully" });
});

/* ---------------- SERVER ---------------- */
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
