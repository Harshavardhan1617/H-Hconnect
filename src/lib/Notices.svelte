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
    console.log(notices);
  });
  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
  }
</script>

<div class="notice-board">
  <h1>Notices</h1>
  {#each notices as notice (notice.textID)}
    <Notice
      notice={{
        text: notice.text,
        user: notice.username,
        time: formatDate(notice.dateTime),
      }}
    />
  {/each}

  <div class="input-area">
    <Input isNotice={true} />
  </div>
</div>

<style>
  .notice-board {
    display: inline-block;
    height: 100vh;
    width: 75%;
    padding-left: 8px;
  }

  .input-area {
    position: absolute;
    width: 60%;
    bottom: 10px;
  }
</style>
