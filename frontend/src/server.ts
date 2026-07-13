const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("TaMaD Backend Running");
});

app.get("/api/tasks", (req, res) => {
  res.json([
    {
      id: 1,
      title: "Build AI Dashboard",
      priority: "High",
      completed: false,
    },
    {
      id: 2,
      title: "Design Premium UI",
      priority: "Medium",
      completed: true,
    },
  ]);
});

app.get("/api/analytics/summary", (req, res) => {
  res.json({
    totalTasks: 24,
    completed: 18,
    productivity: 76,
    focusHours: 42,
  });
});

app.get("/api/analytics/trend", (req, res) => {
  res.json([
    { day: "Mon", completed: 3 },
    { day: "Tue", completed: 5 },
    { day: "Wed", completed: 4 },
    { day: "Thu", completed: 7 },
    { day: "Fri", completed: 6 },
  ]);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});