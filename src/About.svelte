<script>
    export let data = [];
</script>

<article>
    <div class="part">
        <h2>Who am I ?</h2>
        <h3>- Two name</h3>
        <p>I use two pseudonym :</p>
        <ul>
            <li>Its-Just-Nans</li>
            <li>n4n5</li>
        </ul>
        <h4
            style="cursor: pointer;width: fit-content;"
            onclick="this.style.color = 'me' == 'me' ? 'green' : 'red'"
            data-tooltip="Click to see the truth !"
        >
            this.style.color = 'Its-Just-Nans' == 'n4n5' ? 'green' : 'red';
        </h4>
        <h3>- Bio</h3>
        <p>Bio soon...</p>
    </div>
    <div class="part">
        <h2>Quick links</h2>
        <a href="https://its-just-nans.github.io/golb/">
            <h4 style="color: blue">Link to golb</h4>
        </a>
        <a href="https://its-just-nans.github.io/rt/">
            <h4 style="color: blue">Link to R&T website</h4>
        </a>
    </div>
    <div class="part">
        <h2>Languages</h2>
        <div class="center">
            {#each data as oneLang, index}
                <div class="lang">
                    <a href={oneLang.link} data-tooltip={oneLang.name}>
                        <img
                            class="iconLang"
                            alt={oneLang.name}
                            src={oneLang.ico}
                        />
                    </a>
                </div>
            {/each}
        </div>
        <div class="center" style="margin-top:20px">
            <h3>GitHub stats</h3>
            <div class="inline">
                <img
                    class="svgGithubStat"
                    alt=""
                    src="https://github-readme-stats.vercel.app/api?username=its-just-nans&hide_border=true&show_icons=true"
                />
            </div>
            <div class="inline">
                <img
                    class="svgGithubStat"
                    alt=""
                    src="https://github-readme-stats.vercel.app/api/top-langs/?username=its-just-nans&layout=compact&hide_border=true&show_icons=true"
                />
            </div>
        </div>
    </div>
    <div class="part center">
        <h2>Thanks for watching</h2>
        <div>
            <p class="inline">Made with</p>
            <a href="https://svelte.dev" target="_blank">
                <p class="inline svelte-txt">Svelte</p>
                <img
                    class="inline svelte-logo"
                    src="https://svelte.dev/favicon.png"
                    alt=""
                />
            </a>
            <p class="inline">!</p>
        </div>
    </div>
</article>

<style>
    .svgGithubStat {
        width: 90vw;
        min-width: 200px;
        max-width: 400px;
    }
    .svelte-txt {
        color: orange;
        font-weight: bolder;
    }
    .inline {
        display: inline-block;
    }
    .svelte-logo {
        height: 24px;
        vertical-align: middle;
    }
    .lang {
        display: inline-block;
    }
    .center {
        text-align: center;
    }
</style>
