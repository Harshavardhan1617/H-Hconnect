<script>
  import { getContext } from "svelte";
  import { USER_CONTEXT_KEY } from "./context.js";

  export let msg;

  const { userStore } = getContext(USER_CONTEXT_KEY);
  $: userData = $userStore;
</script>

<div class="message-wrapper">
  {#if userData}
    <div class="message {msg.uid === userData.uid ? 'sent' : 'received'}">
      <p>{msg.text}</p>
    </div>
  {/if}
</div>

<style>
  .message-wrapper {
    margin: 0.5rem 0;
    display: flex;
    width: 100%;
  }

  .message {
    max-width: 80%;
    padding: 0.5rem 1rem;
    border-radius: 1rem;
    word-break: break-word;
  }

  .sent {
    margin-left: auto;
    background-color: #d782ba;
    color: #000;
  }

  .received {
    margin-right: auto;
    background-color: #e0efda;
    color: #000;
  }

  p {
    margin: 0;
    line-height: 1.4;
  }
</style>
