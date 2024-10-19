<script>
  import Notices from "./lib/Notices.svelte";
  import Messenger from "./lib/Messenger.svelte";
  import Login from "./lib/Login.svelte";
  import { onMount } from "svelte";

  let isAuthenticated = false;
  let isLoading = true; // Add loading state
  let user = null;

  onMount(async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        if (!data.error) {
          user = data.username;
          isAuthenticated = true;
        }
      }
    } catch (error) {
      console.error("Failed to check authentication status:", error);
    } finally {
      isLoading = false; // Set loading to false when done
    }
  });

  function handleLogin(event) {
    user = event.detail.username;
    isAuthenticated = true;
  }
</script>

<main>
  {#if isLoading}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  {:else if isAuthenticated}
    <Notices />
    <Messenger />
  {:else}
    <Login on:login={handleLogin} />
  {/if}
</main>

<style>
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 1rem;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  p {
    color: #666;
    font-size: 1.1rem;
  }

  main {
    height: 100vh;
  }
</style>
