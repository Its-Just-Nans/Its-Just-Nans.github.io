<script>
    import Header from "./Header.svelte";
    import nav from "./pages.js";

    const getRandomColor = function () {
        var letters = "9ABCDEF";
        var color = "#";
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * letters.length)];
        }
        return color;
    };
    window.onhashchange = () => {
        if (window.location.hash.substring(1) !== actualNav.route) {
            changeNav();
        }
    };
    let color = getRandomColor();
    setInterval(() => {
        color = getRandomColor();
    }, 5000);
    let actualNav = {};
    async function changeNav(index = -1) {
        if (index == -1) {
            let hash = window.location.hash;
            hash = hash.substring(1);
            const newIndex = nav.findIndex((element) => element.route === hash);
            index = newIndex === -1 ? 0 : newIndex;
        } else {
            if (nav[index].route == actualNav.route) {
                // prevent from re-clicking
                // the re-build of a component can be useful sometimes
                return;
            }
        }
        actualNav = nav[index];
        const hash = nav[index].route;
        window.location.hash = hash;
        if (typeof data[actualNav.route] === "undefined") {
            // we load data
            const newData = await nav[index].getData();
            data[actualNav.route] = newData;
        }
    }
    let data = {};
    changeNav();
</script>

<Header globalColor={color} title="Its-Just-Nans" actualNav={changeNav} {nav} />
<main style="--globalColor: {color}">
    {#key actualNav}
        <svelte:component
            this={actualNav.component}
            bind:data={data[actualNav.route]}
        />
    {/key}
</main>

<style>
    :global(article) {
        padding-top: 10px;
        padding-left: 25vw;
        padding-right: 25vw;
        padding-bottom: 100px;
        min-height: calc(100vh - var(--header));
    }
    @media screen and (max-width: 1024px) {
        :global(article) {
            padding-top: 50px !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
        }
        /* width */
    }

    @media screen and (min-width: 512px) {
        :global(article::-webkit-scrollbar) {
            width: 10px;
        }

        /* Track */
        :global(article::-webkit-scrollbar-track) {
            background: #f1f1f1;
        }

        /* Handle */
        :global(::-webkit-scrollbar-thumb) {
            background: #888;
        }
        /* Handle on hover */
        :global(::-webkit-scrollbar-thumb:hover) {
            background: #555;
        }
    }
</style>
