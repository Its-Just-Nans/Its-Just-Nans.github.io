<script>
    export let content;
    export let index;
    export let type;
    let open = false;
    let change = false;
    $: open = type.includes("open") ? true : false;
    $: change = type.includes("change") ? true : false;
    const viewBox = "0 0 24 24";
    const svg1 = "M19 13H5v-2h14v2z";
    const svg2 = "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z";
</script>

<div
    class="historyLine"
    class:toRight={change && index % 2 == 0}
    class:toLeft={change && index % 2 == 1}
    class:historyLineOpen={open}
>
    <div
        class="firstDiv"
        on:click={() => {
            open = !open;
        }}
    >
        <p>{content.date1 || "?"}{content.date2 || ""}</p>
        <div class="titleContainer">
            <img class="iconSmall" src={content.ico || ""} alt="" />
            <p class="title">{content.title || ""}</p>
        </div>
        <div class="plusOrMinus iconShowMore">
            {#if open}
                <svg focusable="false" {viewBox} aria-hidden="true"
                    ><path d={svg1} /></svg
                >
            {:else}
                <svg focusable="false" {viewBox} aria-hidden="true"
                    ><path d={svg2} /></svg
                >
            {/if}
        </div>
    </div>
    <div class="secondDiv">
        <div class="historyDetail">{@html content.desc || ""}</div>
    </div>
</div>

<style>
    .historyLine {
        white-space: nowrap;
        font-family: Roboto, "Segoe UI", Tahoma, sans-serif;
        border: 1px solid var(--border-color);
        margin-bottom: 20px;
        border-radius: 5px 5px 5px 5px;
        transition: box-shadow 0.1s;
        min-width: 260px;
    }
    .firstDiv > p {
        border-right: 1px solid var(--border-color);
        flex: 25;
        text-align: center;
        vertical-align: middle;
    }
    .titleContainer {
        border-right: 1px solid var(--border-color);
        flex: 65;
        display: inline-flex;
        overflow: auto;
        padding: 0px 5px;
    }
    .titleContainer > .iconSmall {
        margin: auto;
    }
    .historyLine p {
        padding: 10px 0px 10px 0px;
        margin: 0px;
    }
    .titleContainer::-webkit-scrollbar {
        width: 10px;
        height: 5px;
    }
    .titleContainer::-webkit-scrollbar-track {
        background: #f1f1f1;
    }
    .titleContainer::-webkit-scrollbar-thumb {
        background: #888;
    }
    .titleContainer::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
    .titleContainer > img {
        height: 32px;
        width: 32px;
        vertical-align: middle;
    }
    .title {
        flex: 0.95;
        text-align: left;
        vertical-align: middle;
    }
    .plusOrMinus {
        margin: auto;
        flex: 5;
        height: 40px;
        text-align: center;
    }
    .plusOrMinus > svg {
        height: 40px;
    }
    .toRight {
        margin-left: 50%;
    }
    .toLeft {
        margin-right: 50%;
    }
    .secondDiv {
        flex: 5;
    }
    .historyDetail::-webkit-scrollbar {
        width: 10px;
        height: 10px;
    }
    .historyDetail::-webkit-scrollbar-track {
        background: #f1f1f1;
    }
    .historyDetail::-webkit-scrollbar-thumb {
        background: #888;
    }
    .historyDetail::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
    .historyLine:hover {
        box-shadow: 0px 0px 0px 5px blue;
        border: 1px dashed var(--border-color);
    }
    .historyLineOpen:hover {
        box-shadow: none;
        border: 1px solid var(--border-color);
    }
    .historyLine:hover > .firstDiv > p {
        border-right: 1px dashed var(--border-color);
    }
    .historyLine:hover > .firstDiv > .titleContainer {
        border-right: 1px dashed var(--border-color);
    }
    .historyLineOpen:hover > .firstDiv > p {
        border-right: 1px solid var(--border-color) !important;
    }
    .historyLineOpen:hover > .firstDiv > .titleContainer {
        border-right: 1px solid var(--border-color) !important;
    }

    .historyLine .iconSmall {
        margin: auto;
    }
    .historyLine p {
        padding: 10px 0px 10px 0px;
        margin: 0px;
    }
    .historyLine > div:nth-child(1) {
        display: flex;
        cursor: pointer;
        line-height: 32px;
    }
    .historyLine > div:nth-child(2) {
        background-color: whitesmoke;
        border-radius: 5px;
        text-align: initial;
        height: 0px;
        overflow: hidden;
    }
    .historyLineOpen > div:nth-child(2) {
        height: auto;
    }
    .historyLine > div:nth-child(2) > div {
        padding: 10px;
    }
    .historyLineOpen > div:nth-child(1) {
        border-bottom: 1px solid var(--border-color);
    }
    .historyDetail {
        overflow: auto;
    }
    :global(.historyDetail a) {
        font-weight: bold;
        color: blue;
    }
</style>
