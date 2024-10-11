<script>
  import Notice from "./lib/Notice.svelte";

  const sampleNotice = {
    text: "hola soy dora",
    user: "dora",
    time: "now or never",
  };
</script>

<Notice notice={sampleNotice} />
