import express from "express";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import crypto from "crypto";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

const db = new sqlite3.Database(join(__dirname, "data.sqlite"), (err) => {
  if (err) {
    return console.error(err.message);
  }
  db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'texts', 'metadata', 'lastSeen');",
    (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (!row) {
        console.log("db is empty");
        const sql = fs.readFileSync("load.sql").toString();
        db.exec(sql, (err) => {
          if (err) {
            return console.error(err.message);
          }
          console.log("SQL file loaded successfully.");
        });
      } else {
        console.log("Database already contains data, skipping SQL loading.");
      }
    }
  );
});

// Promisified password hashing
function hashPassword(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 310000, 32, "sha256", (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey);
    });
  });
}

app.post("/api/register", async (req, res, next) => {
  try {
    if (!req.body.username || !req.body.password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const salt = crypto.randomBytes(16);
    const hashedPassword = await hashPassword(req.body.password, salt);

    // Check if username already exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get(
        "SELECT username FROM users WHERE username = ?",
        [req.body.username],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Insert new user
    db.run(
      "INSERT INTO users (username, password, salt) VALUES (?, ?, ?)",
      [req.body.username, hashedPassword, salt],
      function (err) {
        if (err) return next(err);

        const user = {
          uid: this.lastID.toString(),
          username: req.body.username,
        };

        req.login(user, (err) => {
          if (err) return next(err);
          res.json({ success: true, user: { username: user.username } });
        });
      }
    );
  } catch (error) {
    next(error);
  }
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await new Promise((resolve, reject) => {
        db.get(
          "SELECT * FROM users WHERE username = ?",
          [username],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      if (!user) {
        return done(null, false, { message: "Invalid username or password" });
      }

      const hashedPassword = await hashPassword(password, user.salt);
      if (!crypto.timingSafeEqual(hashedPassword, user.password)) {
        return done(null, false, { message: "Invalid username or password" });
      }

      return done(null, {
        uid: user.uid,
        username: user.username,
      });
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  const userId = user.id || user.uid;
  if (!userId) {
    return done(new Error("User ID not found"));
  }
  done(null, userId);
});

passport.deserializeUser((id, done) => {
  db.get("SELECT uid, username FROM users WHERE uid = ?", [id], (err, row) => {
    if (err) return done(err);
    if (!row) return done(null, false);
    done(null, {
      uid: row.uid,
      username: row.username,
    });
  });
});

app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res
        .status(401)
        .json({ error: info.message || "Authentication failed" });
    }
    req.login(user, (err) => {
      if (err) return next(err);
      return res.json({
        success: true,
        user: { username: user.username, uid: user.uid },
      });
    });
  })(req, res, next);
});

app.post("/api/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
};

const handleApiResponse = (res, queryFunction) => {
  queryFunction()
    .then((data) => res.json(data))
    .catch((err) => res.status(500).json({ error: err.message }));
};

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

const baseQuery = `
  SELECT t.textID, t.text, u.userName, m.dateTime, m.uid
  FROM texts t
  JOIN metaData m ON t.textID = m.textID
  JOIN users u ON m.uid = u.uid
  WHERE m.isNotice = ?;
`;

const executeInsert = (queries, params = []) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      try {
        //  insert into texts table
        db.run(
          "INSERT INTO texts (textID, text) VALUES (?, ?)",
          [params[0], params[1]],
          function (err) {
            if (err) {
              db.run("ROLLBACK");
              reject(err);
              return;
            }

            //  insert into metaData table
            db.run(
              "INSERT INTO metaData (textID, uid, dateTime, isNotice) VALUES (?, ?, ?, ?)",
              [params[0], params[2], params[3], params[4]],
              function (err) {
                if (err) {
                  db.run("ROLLBACK");
                  reject(err);
                  return;
                }

                db.run("COMMIT", (err) => {
                  if (err) {
                    db.run("ROLLBACK");
                    reject(err);
                    return;
                  }
                  resolve({
                    success: true,
                    textID: params[0],
                  });
                });
              }
            );
          }
        );
      } catch (err) {
        db.run("ROLLBACK");
        reject(err);
      }
    });
  });
};

app.post("/api/insertText", isAuthenticated, (req, res) => {
  if (!req.body.textBody || !req.body.textBody.text) {
    return res.status(400).json({ error: "Missing text content" });
  }
  const textID = crypto.randomUUID();
  const now = new Date().getTime();

  const params = [
    textID,
    req.body.textBody.text,
    req.user.uid,
    now,
    req.body.textBody.isNotice || false,
  ];

  executeInsert(null, params)
    .then((result) => res.json(result))
    .catch((err) => {
      console.error("Insert error:", err);
      res.status(500).json({ error: err.message });
    });
});

app.get("/api/notices", (req, res) => {
  handleApiResponse(res, () => executeQuery(baseQuery, [true]));
});

app.get("/api/messages", (req, res) => {
  handleApiResponse(res, () => executeQuery(baseQuery, [false]));
});

app.post("/api/updateLastSeen", (req, res) => {
  const { uid, timeStamp } = req.body;
  console.log("received lastseen update", uid, timeStamp);

  const sql = `
    UPDATE lastSeen
    SET timeStamp = ?
    WHERE uid = ?
  `;

  db.run(sql, [timeStamp, uid], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      db.run(
        "INSERT INTO lastSeen (uid, timeStamp) VALUES (?, ?)",
        [uid, timeStamp],
        (insertErr) => {
          if (insertErr) {
            return res.status(500).json({ error: insertErr.message });
          }
          res.sendStatus(201);
        }
      );
    } else {
      res.sendStatus(200);
    }
  });
});

app.get("/api/profile", (req, res) => {
  db.all("SELECT * FROM users", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
      return;
    }
    if (rows.length === 0 || rows.length < 2) {
      res.json({ status: "register" });
    } else {
      if (!req.isAuthenticated()) {
        res.status(401).json({
          error: "Authentication required",
        });
        return;
      }
      res.json(req.user);
    }
  });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
