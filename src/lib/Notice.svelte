<script>
  export let notice = {
    text: "hey bro",
    user: "chris Hemsworth",
    time: "12/2/24 17:32",
  };
</script>

<div>
  <p>{notice.text}</p>
  <p>{notice.user}</p>
  <p>{notice.time}</p>
</div>

<style>
  div {
    height: 130px;
    min-width: 200px;
    border-radius: 8px;
    background-color: #95d5b2;
    display: inline-block;
    padding: 12px 18px;
    margin: auto 12px;
  }
</style>
