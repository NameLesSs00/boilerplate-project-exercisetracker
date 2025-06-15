// index.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.static("public"));

// To parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// To parse application/json if needed
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

//task 2 3 done

function generateUniqueId(existingIds, length = 8) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  do {
    id = "";
    for (let i = 0; i < length; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (existingIds.has(id));
  return id;
}

let Users = [
  {
    username: "Alice",
    _id: "a1b2c3d4",
  },
];

app.post("/api/users", (req, res) => {
  const { username } = req.body;

  if (typeof username !== "string" || username.trim() === "") {
    return res
      .status(400)
      .json({ error: "Username is required and must be a non-empty string." });
  }

  const existingIds = new Set(Users.map((u) => u._id));

  const newUser = {
    username: username.trim(),
    _id: generateUniqueId(existingIds),
  };

  Users.push(newUser);
  res.json(newUser);
});

// task 4 5 6 done

app.get("/api/users", (req, res) => {
  res.send(Users);
});

// let Users = [
//   {
//     username: 'Alice',
//     _id: 'a1b2c3d4'
//   }
// ];

// you dont need the username as you can get it from the _id
let Exercises = [
  {
    description: "test",
    duration: 60,
    date: "Mon Jan 01 1990",
    _id: "5fb5853f734231456ccb3b05",
  },
];

// task 7 , 8
app.post("/api/users/:_id/exercises", (req, res) => {
  const findId = req.params._id;
  const user = Users.find((u) => u._id === findId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  let { description, duration, date } = req.body;

  if (!description || !duration) {
    return res
      .status(400)
      .json({ error: "Description and duration are required" });
  }

  duration = Number(duration);
  if (isNaN(duration)) {
    return res.status(400).json({ error: "Duration must be a number" });
  }

  const finalDate = date && date.trim() !== "" ? new Date(date) : new Date();
  const formattedDate = finalDate.toDateString();

  const newExercise = {
    _id: user._id,
    description: description.trim(),
    duration,
    date: formattedDate,
  };

  Exercises.push(newExercise);

  res.json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
    _id: user._id,
  });
});

// no need for username and also count  log is the exercise
let Logs = [
  {
    _id: "5fb5853f734231456ccb3b05",
    log: [
      {
        description: "test",
        duration: 60,
        date: "Mon Jan 01 1990",
      },
    ],
  },
];

//task 9 10
app.get("/api/users/:_id/logs", (req, res) => {
  const findId = req.params._id;
  const user = Users.find((u) => u._id === findId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { from, to, limit } = req.query;

  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  let userLogs = Exercises.filter((ex) => ex._id === findId).filter((ex) => {
    const exDate = new Date(ex.date);
    if (fromDate && exDate < fromDate) return false;
    if (toDate && exDate > toDate) return false;
    return true;
  });

  if (limit) {
    userLogs = userLogs.slice(0, parseInt(limit));
  }

  const formattedLogs = userLogs.map((ex) => ({
    description: String(ex.description),
    duration: Number(ex.duration),
    date: new Date(ex.date).toDateString(),
  }));
  res.json({
    username: user.username,
    count: userLogs.length,
    _id: findId,
    log: userLogs,
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Your app is listening on port " + port);
});
