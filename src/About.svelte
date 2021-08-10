<script>
    export let data = [];
    let links;
    let languages;
    $: links = data[0] || [];
    $: languages = data[1] || [];
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
            {#each languages as oneLang, index}
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
    <div class="part">
        <h2>Social links</h2>
        <div class="overflowTable">
            <table>
                <tbody>
                    {#each links as oneLink, index}
                        <tr>
                            <td>
                                <a href={oneLink.link} target="_blank">
                                    <img
                                        src={oneLink.ico}
                                        class="iconSmall"
                                        alt=""
                                    />
                                </a>
                            </td>
                            <td class="wordBreak hoverBlue">
                                <a href={oneLink.link} target="_blank"
                                    >{oneLink.link}</a
                                >
                            </td>
                            <!-- svelte-ignore missing-declaration -->
                            <td
                                on:click={() => {
                                    copy(oneLink.link);
                                    // smollPopUp({ title: "Copied", msg: "" }, { type: "ok" });
                                }}
                            >
                                <span
                                    ><svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        focusable="false"
                                        class="copyIcon"
                                        ><g
                                            ><path
                                                d="M10 19h8V8h-8v11zM8 7.992C8 6.892 8.902 6 10.009 6h7.982C19.101 6 20 6.893 20 7.992v11.016c0 1.1-.902 1.992-2.009 1.992H10.01A2.001 2.001 0 0 1 8 19.008V7.992z"
                                            /><path
                                                d="M5 16V4.992C5 3.892 5.902 3 7.009 3H15v13H5zm2 0h8V5H7v11z"
                                            /></g
                                        ></svg
                                    ></span
                                >
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
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
    .overflowTable {
        overflow-y: auto;
    }
    .lang {
        display: inline-block;
    }
    .center {
        text-align: center;
    }
</style>
