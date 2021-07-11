<script>
    export let data = [];
    const name = "projects.json";
    const noRender = ["Its-Just-Nans"];
    const getDataFromAPIs = async () => {
        fetch("https://api.github.com/users/Its-Just-Nans/repos")
            .then((newResponse) => {
                newResponse.json().then((newJson) => {
                    if (Array.isArray(newJson)) {
                        if (newJson.length != data.length) {
                            addToData(newJson);
                            smollPopUp(
                                {
                                    title: "Message to admin",
                                    msg: "curl -o data/projects.json https://api.github.com/users/Its-Just-Nans/repos",
                                    button: "Copier",
                                },
                                { type: "ko" },
                                function Copier(rep) {
                                    copy(rep.msg);
                                }
                            );
                        }
                    }
                    getGists();
                });
            })
            .catch(() => {
                getGists();
            });
    };
    const start = () => {
        if (window && window.sessionStorage) {
            const localString = window.sessionStorage.getItem("projects") || {};
            let local;
            try {
                local = JSON.parse(localString) || {};
            } catch (e) {
                local = {};
            }
            if (local !== null) {
                if (
                    typeof local.dataLoaded !== "undefined" ||
                    local.dataLoaded === true
                ) {
                    const areGistPresent = data.find((element) =>
                        element.url.startsWith("https://api.github.com/gists/")
                    );
                    if (areGistPresent) {
                        return;
                    }
                }
            }
            getDataFromAPIs();
            window.sessionStorage.setItem(
                "projects",
                JSON.stringify({
                    ...local,
                    dataLoaded: true,
                })
            );
        }
    };
    start();
    function getGists() {
        fetch("https://api.github.com/users/its-just-nans/gists").then(
            (newResponse) => {
                newResponse.json().then((newJson) => {
                    if (Array.isArray(newJson)) {
                        addToData(newJson);
                    }
                });
            }
        );
    }
    const addToData = (array) => {
        for (const oneElement of array) {
            const isInArray = data.findIndex((element) => {
                return element.url === oneElement.url;
            });
            if (isInArray) {
                data = [...data, oneElement];
            }
        }
    };
    let clicked = -20;
</script>

<article>
    <div class="projects">
        {#each data as oneData, index}
            {#if oneData.fork == false && !noRender.includes(oneData.name)}
                <div
                    class="projectsDiv"
                    on:click={() => {
                        if (clicked == index) {
                            clicked = -20;
                        } else {
                            clicked = index;
                        }
                    }}
                >
                    <img
                        class="block cursorPointer"
                        src={`https://github-readme-stats.vercel.app/api/pin/?username=its-just-nans&repo=${oneData.name}`}
                        alt=""
                    />
                </div>
            {/if}
            {#if oneData.url && oneData.url.startsWith("https://api.github.com/gists")}
                <div
                    class="projectsDiv"
                    on:click={() => {
                        if (clicked == index) {
                            clicked = -20;
                        } else {
                            clicked = index;
                        }
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="block cursorPointer"
                        width="400"
                        height="120"
                        viewBox="0 0 400 120"
                        fill="black"
                    >
                        <rect
                            x="0.5"
                            y="0.5"
                            rx="4.5"
                            height="99%"
                            stroke="#e4e2e2"
                            width="399"
                            fill="#fffefe"
                            stroke-opacity="1"
                        />
                        <g transform="translate(25, 35)">
                            <g transform="translate(0, 0)">
                                <svg
                                    class="icon"
                                    x="0"
                                    y="-13"
                                    viewBox="0 0 24 24"
                                    version="1.1"
                                    width="24"
                                    height="24"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M1.75 1.5a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25V1.75a.25.25 0 00-.25-.25H1.75zM0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0114.25 16H1.75A1.75 1.75 0 010 14.25V1.75zm9.22 3.72a.75.75 0 000 1.06L10.69 8 9.22 9.47a.75.75 0 101.06 1.06l2-2a.75.75 0 000-1.06l-2-2a.75.75 0 00-1.06 0zM6.78 6.53a.75.75 0 00-1.06-1.06l-2 2a.75.75 0 000 1.06l2 2a.75.75 0 101.06-1.06L5.31 8l1.47-1.47z"
                                    />
                                </svg>
                            </g>
                            <g transform="translate(25, 0)">
                                <text x="0" y="0"
                                    >Gist - {oneData.description
                                        .substring(0, 24)
                                        .trim()
                                        .concat(
                                            oneData.description.length > 24
                                                ? "..."
                                                : ""
                                        )}</text
                                >
                            </g>
                        </g>
                    </svg>
                </div>
            {/if}
            {#if index == clicked}
                <br />
                <div class="projectsDiv projectHelp">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="400"
                        height="120"
                        viewBox="0 0 400 120"
                        fill="black"
                    >
                        <rect
                            x="0.5"
                            y="0.5"
                            rx="4.5"
                            height="99%"
                            stroke="#e4e2e2"
                            width="399"
                            fill="#fffefe"
                            stroke-opacity="1"
                        />
                        <g transform="translate(25, 35)">
                            <g transform="translate(25, 0)">
                                <text x="0" y="0"
                                    >{oneData.url.startsWith(
                                        "https://api.github.com/gists"
                                    )
                                        ? oneData.description
                                              .substring(0, 24)
                                              .trim()
                                              .concat(
                                                  oneData.description.length >
                                                      24
                                                      ? "..."
                                                      : ""
                                              )
                                        : oneData.name}</text
                                >
                            </g>
                        </g>
                        <a
                            href={oneData.html_url}
                            target="_blank"
                            class="cursorPointer"
                        >
                            <g transform="translate(25, 75)">
                                <g transform="translate(0, 0)">
                                    <svg
                                        class="icon"
                                        x="0"
                                        y="-13"
                                        viewBox="0 0 38 38"
                                        version="1.1"
                                        width="16"
                                        height="16"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            d="M18,1.4C9,1.4,1.7,8.7,1.7,17.7c0,7.2,4.7,13.3,11.1,15.5
                                        c0.8,0.1,1.1-0.4,1.1-0.8c0-0.4,0-1.4,0-2.8c-4.5,1-5.5-2.2-5.5-2.2c-0.7-1.9-1.8-2.4-1.8-2.4c-1.5-1,0.1-1,0.1-1
                                        c1.6,0.1,2.5,1.7,2.5,1.7c1.5,2.5,3.8,1.8,4.7,1.4c0.1-1.1,0.6-1.8,1-2.2c-3.6-0.4-7.4-1.8-7.4-8.1c0-1.8,0.6-3.2,1.7-4.4
                                        c-0.2-0.4-0.7-2.1,0.2-4.3c0,0,1.4-0.4,4.5,1.7c1.3-0.4,2.7-0.5,4.1-0.5c1.4,0,2.8,0.2,4.1,0.5c3.1-2.1,4.5-1.7,4.5-1.7
                                        c0.9,2.2,0.3,3.9,0.2,4.3c1,1.1,1.7,2.6,1.7,4.4c0,6.3-3.8,7.6-7.4,8c0.6,0.5,1.1,1.5,1.1,3c0,2.2,0,3.9,0,4.5
                                        c0,0.4,0.3,0.9,1.1,0.8c6.5-2.2,11.1-8.3,11.1-15.5C34.3,8.7,27,1.4,18,1.4z"
                                        />
                                    </svg>
                                </g>
                                <g transform="translate(25, 0)">
                                    <text x="0" y="0"
                                        >{oneData.url.startsWith(
                                            "https://api.github.com/gists"
                                        )
                                            ? "View the Gist on GitHub"
                                            : "View the repository on GitHub"}</text
                                    >
                                </g>
                            </g>
                        </a>
                        {#if oneData.homepage}
                            <a
                                href={oneData.homepage}
                                target="_blank"
                                class="cursorPointer"
                            >
                                <g transform="translate(25, 100)">
                                    <g transform="translate(0, 0)">
                                        <svg
                                            class="icon"
                                            x="0"
                                            y="-13"
                                            viewBox="0 0 16 16"
                                            version="1.1"
                                            width="16"
                                            height="16"
                                        >
                                            <path
                                                fill-rule="evenodd"
                                                d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"
                                            />
                                        </svg>
                                    </g>
                                    <g transform="translate(25, 0)">
                                        <text x="0" y="0">View the project</text
                                        >
                                    </g>
                                </g>
                            </a>
                        {/if}
                    </svg>
                </div>
                <br />
            {/if}
        {/each}
    </div>
</article>

<style>
    .block {
        display: block;
    }
    .projects {
        width: 100%;
        text-align: center;
    }
    .projectHelp rect {
        fill: var(--globalColor);
    }
    .projectHelp > svg {
        display: block;
    }
    article {
        padding-left: 10vw !important;
        padding-right: 10vw !important;
    }
    @media screen and (max-width: 1024px) {
        article {
            padding-top: 50px !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
        }
    }
    .projectsDiv > img {
        width: 100%;
    }
    .projectsDiv > svg {
        display: block;
        height: 100% !important;
        width: 100%;
    }
    .projectHelp a:hover text {
        color: blue;
    }
    .projectsDiv {
        display: inline-block;
        margin: 10px 10px 0px 10px;
        text-align: center;
        border-radius: 5px;
        vertical-align: bottom;
        transition: box-shadow 0.25s;
        box-sizing: border-box;
    }
    .projectsDiv:hover {
        box-shadow: 0px 0px 0px 5px var(--globalColor);
    }
    .cursorPointer {
        cursor: pointer;
    }
</style>
