const updateLastseen = async (uid) => {
  const date = new Date();
  const timeStamp = date.valueOf();
  try {
    const response = await fetch("/api/lastSeen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: uid,
        timeStamp: timeStamp,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to update lastSeen");
    }
  } catch (err) {
    console.log(err);
  }
};
