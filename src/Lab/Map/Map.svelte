<script type="text/javascript">
    import { onMount } from "svelte";
    import "leaflet/dist/leaflet.css";
    import { initMap, initCityMarkers } from "./map";

    export let addresses = [];

    onMount(async () => {
        initMap();
        initCityMarkers(addresses);
    });
</script>

<div id="map"></div>

<style type="text/css">
    #map {
        height: 100vh;
        width: 100vw;
    }
</style>
