<script>
    import History from "./History.svelte";
    import Header from "./Header.svelte";
    import Projects from "./Projects.svelte";
    import About from "./About.svelte";

    const getRandomColor = function () {
        var letters = "9ABCDEF";
        var color = "#";
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * letters.length)];
        }
        return color;
    };
    let color = getRandomColor();
    setInterval(() => {
        color = getRandomColor();
    }, 5000);
    let nav = [
        { name: "About", route: "about", component: About, data: "links.json" },
        {
            name: "Projects",
            route: "projects",
            component: Projects,
            data: "projects.json",
        },
        {
            name: "History",
            route: "history",
            component: History,
            data: "history.json",
        },
    ];
    let actualNav = {};
    function changeNav(index) {
        if (index == -1) {
            let hash = window.location.hash;
            hash = hash.substring(1, hash.length);
            let count = 0;
            for (const oneNav of nav) {
                if (hash == oneNav.route) {
                    index = count;
                    break;
                }
                count++;
            }
            if (index == -1) {
                index = 0;
            }
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
        if (nav[index].data) {
            loadData(`./data/${nav[index].data}`);
        } else {
            data = [];
        }
    }
    let data = [];
    function loadData(linkToJson) {
        fetch(linkToJson).then((resp) => {
            resp.json().then((json) => {
                data = json;
            });
        });
    }
    changeNav(-1);
</script>

<Header globalColor={color} title="Its-Just-Nans" actualNav={changeNav} {nav} />
<main style="--globalColor: {color}">
    {#key actualNav}
        <svelte:component this={actualNav.component} {data} />
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
            padding-left: 10px !important;
            padding-right: 10px !important;
        }
    }
    /* width */
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
</style>
