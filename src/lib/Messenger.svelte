<script>
  import { onMount } from "svelte";
  import Messeges from "./Messege.svelte";
  let messeges = [];

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
    console.log(messeges);
  });
</script>

<div>
  <h3>Messeges</h3>
  {#each messeges as messege (messege.textID)}
    <Messeges msg={messege} />
  {/each}
</div>

<style>
  div {
    display: inline-block;
    min-height: 100vh;
    width: 25%;
    background-color: #efc7e5;
    position: absolute;
    right: 0;
    padding-left: 8px;
  }
</style>
