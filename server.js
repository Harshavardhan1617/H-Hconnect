import express from "express";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const db = new sqlite3.Database(join(__dirname, "data.sqlite"));

app.get("/api/notices", (req, res) => {
  const query = `
    SELECT t.textID, t.text, u.userName, m.dateTime
    FROM texts t
    JOIN metaData m ON t.textID = m.textID
    JOIN users u ON m.uid = u.uid
    WHERE m.isNotice = TRUE;
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get("/api/messages", (req, res) => {
  const query = `
      SELECT t.textID, t.text, u.userName, m.dateTime
      FROM texts t
      JOIN metaData m ON t.textID = m.textID
      JOIN users u ON m.uid = u.uid
      WHERE m.isNotice = FALSE;
    `;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
