import express from "express";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import crypto from "crypto";

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

const db = new sqlite3.Database(join(__dirname, "data.sqlite"));

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
      return res.json({ success: true, user: { username: user.username } });
    });
  })(req, res, next);
});

// Add a logout route
app.post("api/logout", function (req, res, next) {
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

app.get("/api/notices", (req, res) => {
  handleApiResponse(res, () => executeQuery(baseQuery, [true]));
});

app.get("/api/messages", (req, res) => {
  handleApiResponse(res, () => executeQuery(baseQuery, [false]));
});

app.get("/api/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({
      error: "Authentication required",
    });
  } else {
    const user = req.user;
    res.json(user);
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
