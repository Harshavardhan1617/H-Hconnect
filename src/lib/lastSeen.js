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

export const fetchLastseen = async () => {
  try {
    const response = await fetch("/api/getLastSeen");
    return response.json();
  } catch (err) {
    throw new Error("failed to fetch lastseen");
  }
};

export function formatLastSeen(timestamp) {
  const now = new Date().valueOf();
  const lastSeenDate = new Date(timestamp).valueOf();
  const diffInMs = now - lastSeenDate;
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Less than 10 minutes - show exact minutes
  if (diffInMins > 5 && diffInMins < 10) {
    return "5 minutes ago";
  }
  // 10-20 minutes
  else if (diffInMins < 20) {
    return "10 minutes ago";
  }
  // 20-30 minutes
  else if (diffInMins < 30) {
    return "20 minutes ago";
  }
  // 30-60 minutes
  else if (diffInMins < 60) {
    return "30 minutes ago";
  }
  // Hours (up to 24 hours)
  else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }
  // Days
  else {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  }
}
