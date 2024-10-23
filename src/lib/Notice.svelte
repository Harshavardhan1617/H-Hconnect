<script>
  export let notice = {
    text: "hey bro",
    user: "chris Hemsworth",
    time: "12/2/24 17:32",
  };
</script>

<div class="notice-card">
  <p class="notice-text">{notice.text}</p>
  <div class="notice-footer">
    <span class="notice-user">{notice.user}</span>
    <span class="notice-time">{notice.time}</span>
  </div>
</div>

<style>
  .notice-card {
    background-color: #95d5b2;
    border-radius: 12px;
    padding: 16px;
    width: 100%;
  }

  .notice-text {
    font-size: 1rem;
    margin: 0 0 12px 0;
    color: #2d3748;
  }

  .notice-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    color: #4a5568;
  }

  .notice-user {
    font-weight: 500;
  }

  .notice-time {
    color: #4a5568;
  }
</style>
