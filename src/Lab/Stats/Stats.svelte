<script lang="ts">
    import { onMount } from "svelte";
    let username = "Its-Just-Nans";
    const updateParam = () => {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("username", username);
        window.history.replaceState("", "", newUrl);
    };
    onMount(() => {
        const newUsername = new URLSearchParams(window.location.search).get("username");
        if (newUsername) {
            username = newUsername;
        } else {
            updateParam();
        }
    });
</script>

<h1 class="input">
    Username: <input type="text" bind:value={username} on:input={updateParam} />
</h1>
<br />
{#key username}
    <img src={`https://github-profile-trophy.vercel.app/?username=${username}`} alt="stats" />
    <br />
    <img src={`https://github-readme-stats.vercel.app/api?username=${username}`} alt="stats" />
    <br />
    <img src={`https://github-readme-streak-stats.herokuapp.com/?user=${username}`} alt="stats" />
    <br />
    <img
        src={`https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=${username}`}
        alt="stats"
    />
    <br />
    <img
        src={`https://metrics.lecoq.io/${username}?template=classic&habits=1&followup=1&discussions=1&achievements=1&notable=1&code=1&base=header%2C%20activity%2C%20community%2C%20repositories%2C%20metadata&base.indepth=false&base.hireable=false&base.skip=false&habits=false&habits.from=200&habits.days=14&habits.facts=true&habits.charts=false&habits.charts.type=classic&habits.trim=false&habits.languages.limit=8&habits.languages.threshold=0%25&followup=false&followup.sections=repositories&followup.indepth=false&followup.archived=true&discussions=false&discussions.categories=true&discussions.categories.limit=0&achievements=false&achievements.threshold=C&achievements.secrets=true&achievements.display=detailed&achievements.limit=0&notable=false&notable.from=organization&notable.repositories=false&notable.indepth=false&notable.types=commit&notable.self=false&code=false&code.lines=12&code.load=400&code.days=3&code.visibility=public&config.timezone=Europe%2FParis`}
        alt="stats"
    />
    <br />
    <img
        src={`https://github-widgetbox.vercel.app/api/profile?username=${username}&data=followers,repositories,stars,commits`}
        alt="stats"
    />
{/key}

<style>
    .input {
        text-align: center;
        font-family: monospace;
    }
</style>
