import express from "express";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const db = new sqlite3.Database(join(__dirname, "data.sqlite"));

const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const handleApiResponse = (res, queryFunction) => {
  queryFunction()
    .then((data) => res.json(data))
    .catch((err) => res.status(500).json({ error: err.message }));
};

const baseQuery = `
  SELECT t.textID, t.text, u.userName, m.dateTime, m.uid
  FROM texts t
  JOIN metaData m ON t.textID = m.textID
  JOIN users u ON m.uid = u.uid
  WHERE m.isNotice = ?;
`;

app.get("/api/notices", (req, res) => {
  handleApiResponse(res, () => executeQuery(baseQuery, [true]));
});

app.get("/api/messages", (req, res) => {
  handleApiResponse(res, () => executeQuery(baseQuery, [false]));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
