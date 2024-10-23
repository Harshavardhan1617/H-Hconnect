<script>
  import { onMount } from "svelte";
  import Notice from "./Notice.svelte";
  import Input from "./Input.svelte";

  let notices = [];

  onMount(async () => {
    try {
      const response = await fetch("/api/notices");
      if (response.ok) {
        notices = await response.json();
      } else {
        console.error("Failed to fetch notices");
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  });

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
  }
</script>

<div class="notice-board">
  <h1 class="board-title">Notices</h1>
  <div class="notices-container">
    {#each notices as notice (notice.textID)}
      <Notice
        notice={{
          text: notice.text,
          user: notice.username,
          time: formatDate(notice.dateTime),
        }}
      />
    {/each}
  </div>
  <div class="input-wrapper">
    <Input isNotice={true} />
  </div>
</div>

<style>
  .notice-board {
    height: 100vh;
    width: 75%;
    padding: 24px;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .board-title {
    font-size: 2rem;
    color: #2d3748;
    margin-bottom: 24px;
  }

  .notices-container {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 100px;
  }

  .input-wrapper {
    position: fixed;
    bottom: 24px;
    width: 70%;
    max-width: 800px;
  }
</style>
