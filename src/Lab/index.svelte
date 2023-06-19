<script>
    import { onMount } from "svelte";
    import ContextMenu from "./ContextMenu.svelte";

    let showMenu = false;
    let x = 0;
    let y = 0;
    const hideMenu = () => {
        showMenu = false;
    };
    const onRightClick = (e) => {
        e.preventDefault();
        window.addEventListener("click", hideMenu, false);
        showMenu = true;
        x = e.clientX;
        y = e.clientY;
    };
    onMount(() => {
        window.addEventListener("contextmenu", onRightClick, false);
        return () => {
            window.removeEventListener("contextmenu", onRightClick, false);
            window.removeEventListener("click", hideMenu, false);
        };
    });
</script>

<svelte:head>
    <title>lab - n4n5 pages</title>
</svelte:head>

{#if showMenu}
    <div
        class="context"
        style={`position: absolute; top: ${y}px; left: ${x}px;`}
        on:click={(e) => {
            e.stopPropagation();
        }}
    >
        <ContextMenu />
    </div>
{/if}
