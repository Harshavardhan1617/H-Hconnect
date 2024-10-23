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
    margin: 12px 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    transition: transform 0.2s ease;
  }

  .notice-card:hover {
    transform: translateY(-2px);
  }

  .notice-text {
    font-size: 1.1rem;
    margin: 0 0 12px 0;
    line-height: 1.4;
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
    font-weight: 600;
  }

  .notice-time {
    color: #718096;
  }
</style>
