<script>
    export let title;
    export let nav = [];
    export let actualNav;
    export let globalColor;
    function returnBase() {
        actualNav(0);
    }
</script>

<header style="--globalColor: {globalColor}">
    <div class="title">
        <div class="titleContainer">
            <h1
                on:click={() => {
                    returnBase();
                }}
                class="cursorPointer"
            >
                {title}
            </h1>
        </div>
        <div class="imgContainer">
            <img
                on:click={() => {
                    returnBase();
                }}
                alt=""
                class="cursorPointer"
                src="https://raw.githubusercontent.com/Its-Just-Nans/Its-Just-Nans/main/n4n5.png"
            />
        </div>
    </div>
    <div class="space" />
    <div class="navLinks">
        {#each nav as { name }, index}
            <h2
                on:click={() => {
                    actualNav(index);
                }}
            >
                {name}
            </h2>
        {/each}
    </div>
</header>

<style>
    .cursorPointer {
        cursor: pointer;
    }
    header {
        position: fixed;
        top: 0px;
        display: flex;
        margin: auto;
        width: 100vw;
        height: var(--header);
        z-index: 10;
        background-color: var(--globalColor);
        text-align: center;
        border-bottom: 1px solid black;
        font-family: system-ui;
        box-sizing: border-box;
    }
    .title {
        padding: 10px;
        flex: 0.35;
        border-right: 1px solid black;
        display: flex;
    }
    .titleContainer > h1 {
        flex: 0.75;
        font-weight: 300;
        margin: 0px;
        margin-top: 5px;
    }
    .titleContainer {
        text-align: right;
        flex: 0.8;
    }
    .imgContainer {
        flex: 0.2;
        height: 100%;
    }
    .imgContainer > img {
        height: 100%;
    }

    :global(*) {
        font-family: monospace;
        --header: 60px;
    }
    .space {
        flex: 0.3;
    }
    .navLinks {
        display: flex;
        flex: 0.35;
        padding: 10px 0px;
        border-left: 1px solid black;
    }
    .navLinks > h2:first-child {
        margin-left: 10px;
    }
    h2 {
        font-size: 1.2em;
        font-weight: 200;
        margin-right: 10px;
        cursor: pointer;
    }
    .navLinks > h2:hover {
        text-decoration: underline;
    }
    @media screen and (max-width: 1024px) {
        .title {
            flex: 0.8;
        }
        .navLinks {
            display: none;
        }
        .space {
            display: none;
        }
    }
</style>
