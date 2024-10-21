<script>
  import { getContext } from "svelte";
  import { USER_CONTEXT_KEY } from "./context";

  export let isNotice;

  const { userStore } = getContext(USER_CONTEXT_KEY);
  $: userData = $userStore;
  let textBody = {};

  const handleSubmit = async () => {
    textBody.uid = userData.uid;
    textBody.isNotice = isNotice;
    console.log(textBody);

    try {
      const response = await fetch("/api/insertText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          textBody,
        }),
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

<div class="container">
  <div class="entry-area">
    <input bind:value={textBody.text} type="text" />
  </div>
  <button on:click={handleSubmit}>send</button>
</div>

<style>
  .container {
    background-color: aliceblue;
    padding: 20px;
    display: flex;
    gap: 10px;
  }
  .entry-area {
    position: relative;
    height: 80px;
    width: 100%;
    line-height: 80px;
  }
  input {
    width: 100%;
    outline: none;
    font-size: 1.2em;
    padding: 0 25px;
    line-height: 40px;
    border-radius: 12px;
    border: 2px solid #7209b7;
    background: transparent;
    transition: 0.2s ease;
  }
</style>
