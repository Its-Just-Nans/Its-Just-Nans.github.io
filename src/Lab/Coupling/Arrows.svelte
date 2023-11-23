<script>
    import OneArrow from "./OneArrow.svelte";
</script>

<div>
    <OneArrow name="ArrowLeft" />
    <OneArrow name="ArrowRight" />
    <OneArrow name="ArrowUp" />
    <OneArrow name="ArrowDown" />
</div>

<style>
    div {
        position: absolute;
        bottom: 0px;
        width: 100%;
        text-align: center;
        z-index: 10;
    }
</style>
