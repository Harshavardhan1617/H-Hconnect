<script>
  import { getContext } from "svelte";
  import { USER_CONTEXT_KEY } from "./context.js";

  export let msg;

  const { userStore } = getContext(USER_CONTEXT_KEY);
  $: userData = $userStore;
</script>

<div>
  <div id={msg.uid === userData.uid ? "right" : "left"}>
    <p>
      {msg.text}
    </p>
  </div>
</div>

<style>
  div {
    display: block;
  }

  #left {
    display: inline-block;
    min-height: 28px;
    max-width: 300px;
    border-radius: 16px;
    padding: 5px 25px 5px 10px;
    color: #000000;
    background-color: #e0efda;
    margin: 8px 4px;
  }

  #right {
    display: inline-block;
    min-height: 28px;
    max-width: 300px;
    border-radius: 16px;
    padding: 5px 25px 5px 10px;
    background-color: #d782ba;
    color: #000000;
    margin: 8px 4px;
    position: absolute;
    right: 12px;
  }

  div p {
    transform: translateY(2px);
    margin: 0;
    padding: 0;
  }
</style>
