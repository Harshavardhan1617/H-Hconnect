<script>
  import { onMount } from "svelte";
  import Notice from "./lib/Notice.svelte";
  import Messenger from "./lib/Messenger.svelte";

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

<main>
  <div>
    <h1>Notices</h1>
    {#each notices as notice}
      <Notice
        notice={{
          text: notice.text,
          user: notice.userName,
          time: formatDate(notice.dateTime),
        }}
      />
    {/each}
  </div>
  <Messenger />
</main>

<style>
  div {
    display: inline-block;
  }
</style>
