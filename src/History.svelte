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

<article>
    <div style="text-align: center;">
        <button
            class="style-4"
            on:click={() => {
                changeType("open");
            }}
        >
            Open/Close
        </button>
        <button
            class="style-4"
            on:click={() => {
                changeType("change");
            }}
        >
            change
        </button>
    </div>
    <br />
    {#each data as oneData, index}
        <Article {type} content={oneData} {index} />
    {/each}
</article>

<style>
    button {
        font-weight: 600;
        border: solid 2px black;
        outline: 0;
        margin-bottom: 5px;
        font-size: 1.5rem;
        letter-spacing: 0.08rem;
        background-color: white;
        border-radius: 0.35rem;
        position: relative;
        cursor: pointer;
        transition: box-shadow 0.1s;
    }
    button:hover {
        box-shadow: 0px 0px 0px 5px blue;
        border: 1px dashed var(--border-color);
    }
</style>
