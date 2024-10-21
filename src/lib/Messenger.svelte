<script>
  import { onMount } from "svelte";
  import { getContext } from "svelte";
  import Messeges from "./Messege.svelte";
  import Input from "./Input.svelte";
  import { USER_CONTEXT_KEY } from "./context.js";
  import { get } from "svelte/store";

  let messeges = [];
  const { userStore } = getContext(USER_CONTEXT_KEY);

  onMount(async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        messeges = await response.json();
      } else {
        console.error("Failed to fetch messeges");
      }
    } catch (error) {
      console.error("Error fetching messeges:", error);
    }
  });
  console.log($userStore);
</script>

<div class="messenger">
  <div class="header">
    <h3>Messages</h3>
  </div>
  <div class="messages-container">
    {#if $userStore && messeges.length > 0}
      {#each messeges as messege (messege.textID)}
        <Messeges msg={messege} />
      {/each}
    {:else}
      <div class="loading-messages">
        <p>Loading messages...</p>
      </div>
    {/if}
  </div>
  <div class="input-area">
    <Input isNotice={false} />
  </div>
</div>

<style>
  .messenger {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 25%;
    background-color: #f8e5f3;
    position: fixed;
    right: 0;
    top: 0;
  }

  .header {
    padding: 1rem;
    border-bottom: 1px solid #e0e0e0;
  }

  .header h3 {
    margin: 0;
    color: #333;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .input-area {
    padding: 1rem;
    border-top: 1px solid #e0e0e0;
  }

  .loading-messages {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #666;
  }
</style>
