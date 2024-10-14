<script>
  export let msg = "hello";
</script>

<div>
  <p>
    {msg}
  </p>
</div>

<style>
  div {
    display: inline-block;
    min-height: 28px;
    max-width: 300px;
    border-radius: 16px;
    padding: 5px 25px 5px 10px;
    background-color: #e0efda;
    margin: 8px 4px;
  }

  div p {
    transform: translateY(2px);
    margin: 0;
    padding: 0;
  }
</style>
