import"./BaseLayout.astro_astro_type_script_index_0_lang.154cd3b7.js";const n=`<svg class="svgIco" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M21 11V3h-8l3.29 3.29-10 10L3 13v8h8l-3.29-3.29 10-10z"></path>
            </svg>`,o=`<svg class="svgIco" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M22 3.41 16.71 8.7 20 12h-8V4l3.29 3.29L20.59 2 22 3.41zM3.41 22l5.29-5.29L12 20v-8H4l3.29 3.29L2 20.59 3.41 22z">
                </path>
            </svg>`,s=document.getElementById("button-change");let t=!1;s.onclick=()=>{document.getElementById("articles")?.classList.toggle("historyOpen"),s.innerHTML=t?n:o,t=!t};[...document.getElementsByClassName("firstDiv")].forEach(e=>{e.onclick=()=>{e.parentNode?.classList.toggle("historyLineOpen")}});
