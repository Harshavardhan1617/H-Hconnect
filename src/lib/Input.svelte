<script>
  import { getContext } from "svelte";
  import { USER_CONTEXT_KEY } from "./context";

  export let isNotice;
  const { userStore } = getContext(USER_CONTEXT_KEY);
  $: userData = $userStore;
  let textBody = {};

  const handleSubmit = async () => {
    if (!textBody.text?.trim()) return;

    textBody.uid = userData.uid;
    textBody.isNotice = isNotice;

    try {
      const response = await fetch("/api/insertText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ textBody }),
      });
      if (!response.ok) {
        console.log("failed to send message to server");
        return;
      }
      console.log("msg sent success");
    } catch (error) {
      console.log(error);
    } finally {
      textBody.text = "";
    }
  };
</script>

<div class="input-container">
  <input
    bind:value={textBody.text}
    type="text"
    placeholder={isNotice ? "Post a notice..." : "Type a message..."}
    class="message-input"
  />
  <button class="send-button" on:click={handleSubmit}> Send </button>
</div>

<style>
  .input-container {
    background-color: #fff;
    padding: 16px;
    border-radius: 12px;
    display: flex;
    gap: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .message-input {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #7209b7;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s ease;
    background-color: white;
  }

  .message-input:focus {
    outline: none;
    border-color: #9d4edd;
    box-shadow: 0 0 0 3px rgba(114, 9, 183, 0.1);
  }

  .send-button {
    background-color: #7209b7;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0 24px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .send-button:hover {
    background-color: #9d4edd;
  }
</style>
