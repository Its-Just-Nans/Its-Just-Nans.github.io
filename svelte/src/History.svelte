<script>
    import Article from "./Article.svelte";
    export let data = [];
    let type = "";
    function changeType(newtype) {
        if (type.includes(newtype)) {
            type = type.replace(`${newtype}`, "");
        } else {
            type += ` ${newtype}`;
        }
        type = type.trim();
    }
</script>

<button
    on:click={() => {
        changeType("open");
    }}
    >Close
</button>
<button
    on:click={() => {
        changeType("change");
    }}
    >change
</button>
{#each data as oneData, index}
    <Article {type} content={oneData} {index} />
{/each}
