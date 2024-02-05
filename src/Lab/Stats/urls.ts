export const getUrls = (username: string) => [
    `https://github-profile-trophy.vercel.app/?username=${username}`,
    `https://github-readme-stats.vercel.app/api?username=${username}`,
    `https://github-readme-streak-stats.herokuapp.com/?user=${username}`,
    `https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=${username}`,
    `https://github-widgetbox.vercel.app/api/profile?username=${username}&data=followers,repositories,stars,commits`,
    `https://github-readme-stats.vercel.app/api/top-langs/?username=${username}`,
    `https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&show=reviews,discussions_started,discussions_answered,prs_merged,prs_merged_percentage`,
    `https://github-stats-alpha.vercel.app/api?username=${username}`,
    `https://svg-packages-stats.vercel.app/api?author=n4n5`,
    `https://metrics.lecoq.io/${username}?template=classic&habits=1&followup=1&discussions=1&achievements=1&notable=1&code=1&base=header%2C%20activity%2C%20community%2C%20repositories%2C%20metadata&base.indepth=false&base.hireable=false&base.skip=false&habits=false&habits.from=200&habits.days=14&habits.facts=true&habits.charts=false&habits.charts.type=classic&habits.trim=false&habits.languages.limit=8&habits.languages.threshold=0%25&followup=false&followup.sections=repositories&followup.indepth=false&followup.archived=true&discussions=false&discussions.categories=true&discussions.categories.limit=0&achievements=false&achievements.threshold=C&achievements.secrets=true&achievements.display=detailed&achievements.limit=0&notable=false&notable.from=organization&notable.repositories=false&notable.indepth=false&notable.types=commit&notable.self=false&code=false&code.lines=12&code.load=400&code.days=3&code.visibility=public`,
];
