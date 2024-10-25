<script>
  import { onMount } from "svelte";
  import Notice from "./Notice.svelte";
  import Input from "./Input.svelte";

  let notices = [];
  let noticeBoard;
  function scrollToBottom() {
    if (noticeBoard) {
      setTimeout(() => {
        noticeBoard.scrollTop = noticeBoard.scrollHeight;
      }, 0);
    }
  }

  $: if (notices.length > 0) {
    scrollToBottom();
  }

  const fetchNotices = async () => {
    try {
      const response = await fetch("/api/notices");
      if (response.ok) {
        notices = await response.json();
        scrollToBottom()
      } else {
        console.error("Failed to fetch notices");
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  onMount(fetchNotices);

  function handleNotices(event) {
    fetchNotices();
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
  }
</script>

<div class="notice-board">
  <h1 class="board-title">Notices</h1>
  <div class="notices-grid" bind:this={noticeBoard}>
    {#each notices as notice (notice.textID)}
      <div class="notice-wrapper" class:large={notice.text.length > 100}>
        <Notice
          notice={{
            text: notice.text,
            user: notice.username,
            time: formatDate(notice.dateTime),
          }}
        />
      </div>
    {/each}
  </div>
  <div class="input-wrapper">
    <Input isNotice={true} on:send={fetchNotices} />
  </div>
</div>

<style>
  .notice-board {
    height: 100vh;
    width: 75%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    position: relative;
    background-color: #f8f9fa;
  }

  .board-title {
    font-size: 2rem;
    color: #2d3748;
    margin-bottom: 16px;
    padding-left: 12px;
    border-left: 4px solid #7209b7;
  }

  .notices-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
    padding: 8px;
    overflow-y: auto;
    padding-bottom: 80px;
    align-items: start;
  }

  .notices-grid::-webkit-scrollbar {
    width: 6px;
    display: none;
  }

  .notices-grid::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 3px;
  }

  .notices-grid::-webkit-scrollbar-thumb {
    background-color: #7209b7;
    border-radius: 3px;
  }

  .notice-wrapper {
    width: 100%;
    height: fit-content;
    transition: transform 0.2s ease;
  }

  .notice-wrapper:hover {
    transform: translateY(-2px);
  }

  .notice-wrapper.large {
    grid-column: span 2;
  }

  .input-wrapper {
    position: fixed;
    bottom: 16px;
    width: calc(75% - 32px);
    max-width: 800px;
    z-index: 10;
    background: linear-gradient(to bottom, transparent, #f8f9fa 20%);
    padding-top: 20px;
  }

  @media (max-width: 1024px) {
    .notices-grid {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 10px;
    }

    .notice-wrapper.large {
      grid-column: span 1;
    }
  }

  @media (max-width: 768px) {
    .notice-board {
      width: 100%;
      padding: 12px;
    }

    .input-wrapper {
      width: calc(100% - 24px);
    }
  }
</style>
