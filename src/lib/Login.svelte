<script>
  import flatpickr from "flatpickr";
  import { onMount, createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let username = "";
  let selectedDate = "";
  let datePickerElement;
  let flatpickrInstance;
  let isLoading = false;
  let message = "";

  onMount(() => {
    flatpickrInstance = flatpickr(datePickerElement, {
      dateFormat: "Y-m-d",
      onChange: function (selectedDates) {
        selectedDate = selectedDates[0].getTime().toString();
      },
    });

    return () => {
      if (flatpickrInstance) {
        flatpickrInstance.destroy();
      }
    };
  });

  async function handleSubmit() {
    try {
      isLoading = true;
      message = "";

      if (!username || !selectedDate) {
        throw new Error("Please fill in all fields");
      }

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.toLowerCase(),
          password: selectedDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      dispatch("login", { username: username.toLowerCase() });
    } catch (error) {
      message = error.message;
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css"
  />
</svelte:head>

<div class="form-container">
  <h2>Login</h2>

  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="username">Username:</label>
      <input
        type="text"
        id="username"
        bind:value={username}
        placeholder="Enter username"
        required
      />
    </div>

    <div class="form-group">
      <label for="date">Select Date and Time:</label>
      <input
        type="text"
        id="date"
        bind:this={datePickerElement}
        placeholder="Select date and time"
        required
      />
    </div>

    <button type="submit" disabled={isLoading}>
      {isLoading ? "Logging in..." : "Login"}
    </button>

    {#if message}
      <div
        class="message"
        class:error={message.includes("Error") || message.includes("failed")}
      >
        {message}
      </div>
    {/if}
  </form>
</div>

<style>
  .form-container {
    max-width: 400px;
    margin: 2rem auto;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  h2 {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }

  input {
    width: 95%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  button {
    width: 100%;
    padding: 0.75rem;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  button:hover:not(:disabled) {
    background-color: #45a049;
  }

  .message {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: 4px;
    background-color: #4caf50;
    color: white;
    text-align: center;
  }

  .message.error {
    background-color: #f44336;
  }
</style>
