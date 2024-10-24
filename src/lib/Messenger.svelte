<script>
  import { onMount } from "svelte";
  import { getContext } from "svelte";
  import Message from "./Message.svelte";
  import Input from "./Input.svelte";
  import { USER_CONTEXT_KEY } from "./context.js";

  let messages = [];
  const { userStore } = getContext(USER_CONTEXT_KEY);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        messages = await response.json();
      } else {
        console.error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  onMount(fetchMessages);

  function handleText(event) {
    fetchMessages();
  }
</script>

<div class="messenger">
  <div class="messenger-header">
    <h3>Messages</h3>
  </div>
  <div class="messages-container">
    {#if $userStore && messages.length > 0}
      {#each messages as message (message.textID)}
        <Message msg={message} />
      {/each}
    {:else}
      <div class="loading-messages">
        <p>Loading messages...</p>
      </div>
    {/if}
  </div>
  <div class="messenger-input">
    <Input isNotice={false} on:send={handleText} />
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

  .messenger-header {
    padding: 24px;
    border-bottom: 1px solid rgba(114, 9, 183, 0.1);
  }

  .messenger-header h3 {
    margin: 0;
    color: #2d3748;
    font-size: 1.5rem;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .messenger-input {
    padding: 16px;
    border-top: 1px solid rgba(114, 9, 183, 0.1);
  }

  .loading-messages {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #718096;
  }
</style>
