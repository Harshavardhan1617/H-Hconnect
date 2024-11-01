<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { getContext } from "svelte";
  import Message from "./Message.svelte";
  import Input from "./Input.svelte";
  import { USER_CONTEXT_KEY } from "./context.js";
  import LastSeen from "./LastSeen.svelte";
  const dispatch = createEventDispatcher();

  let messages = [];
  let lastSeen;
  const { userStore } = getContext(USER_CONTEXT_KEY);


  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        messages = await response.json();
        scrollToBottom()
      } else {
        console.error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };


  async function handleLogout() {
    const response = await fetch("/api/logout", {
      method: "POST",
    });
    dispatch("signout");

    if (!response.ok) {
      console.error("Failed to logout:", response.statusText);
      return;
    }

    // window.location.href = "/";
  }

  onMount(fetchMessages);

  function handleText(event) {
    fetchMessages();
  }

  let messagesContainer;

  function scrollToBottom() {
  if (messagesContainer) {
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 0);
  }
}
$: if (messages.length > 0) {
  scrollToBottom();
}
</script>

<div class="messenger">
  <div class="messenger-header">
    <div class="messenger-header-user">
      <h3>{$userStore.otherUser}</h3>
      <LastSeen />
    </div>
    <button class="logout-button" on:click={handleLogout}></button>
  </div>
  <div class="messages-container"  bind:this={messagesContainer}>
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
    display: flex;
    justify-content: space-between;
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

  .messages-container::-webkit-scrollbar {
    display: none;
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

  .logout-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    background-color: transparent;
    border: 1.5px solid #7209b7;
    color: #7209b7;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .logout-button::before {
    content: "Logout";
  }

  .logout-button:hover {
    background-color: #7209b7;
    color: white;
    transform: translateY(-1px);
  }

  .logout-button:active {
    transform: translateY(0px);
  }

  @media (max-width: 768px) {
    .logout-button {
      padding: 6px 12px;
      font-size: 13px;
    }
  }
</style>
