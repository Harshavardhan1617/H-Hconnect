<script>
    import { onMount, onDestroy, getContext } from 'svelte';
    import { fetchLastseen, formatLastSeen, updateLastseen } from './lastSeen';
  import { USER_CONTEXT_KEY } from './context';
  
    let timeData = null;
    let intervalId;
    const { userStore } = getContext(USER_CONTEXT_KEY);
    
    async function updateTime() {
        try {
            updateLastseen($userStore.uid)
            const data = await fetchLastseen();
            timeData = data;
        } catch (error) {
            console.error('Failed to fetch last seen:', error);
        }
    }
  
    onMount(() => {
        updateTime();
        intervalId = setInterval(updateTime, 2 * 60 * 1000);
    });
    
    onDestroy(() => {
        if (intervalId) clearInterval(intervalId);
    });
</script>

<div>
    {#if timeData?.lastseen}
        {#if Date.now() - new Date(timeData.lastseen).getTime() < 1000 * 60 * 5}
            <div id="online">online</div>
        {:else}
           {formatLastSeen(timeData.lastseen)}
        {/if}
    {:else}
        {""}
    {/if}
</div>

<style>
    div {
        font-size: 0.9rem;
        color: #4a5568;
    }

    #online {
        color: #00ff00;
    }
</style>