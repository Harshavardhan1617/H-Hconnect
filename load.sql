CREATE TABLE users (
    "uid" INTEGER PRIMARY KEY AUTOINCREMENT,
    "username" TEXT,
    "password" TEXT,
    "salt" TEXT 
);

CREATE TABLE texts (
    textID INT PRIMARY KEY,
    text VARCHAR(255)
);

CREATE TABLE metaData (
    textID INT,
    uid INT,
    dateTime BIGINT,
    isNotice BOOLEAN,
    FOREIGN KEY (textID) REFERENCES texts(textID),
    FOREIGN KEY (uid) REFERENCES users(uid)
);

CREATE TABLE lastSeen (
    uid INT,
    timeStamp BIGINT,
    FOREIGN KEY (uid) REFERENCES users(uid)
);


INSERT INTO texts (textID, text)
VALUES
    (1, 'test message 1 from user 1'),
    (2, 'test notice 1 from user 1'),
    (3, 'test message 1 from user 2'),
    (4, 'test notice 1 from user 2 ');

INSERT INTO metaData (textID, uid, dateTime, isNotice)
VALUES
    (1, 1, 1729847101000, FALSE),
    (2, 1, 1729847102000, TRUE),
    (3, 2, 1729847103000, FALSE),
    (4, 2, 1729847104000, TRUE);

INSERT INTO lastSeen (uid, timeStamp)
VALUES 
    (1, 1729847101000),
    (2, 1729847103000);