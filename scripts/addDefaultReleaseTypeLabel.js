#!/usr/bin/env node
const { GitHub, context } = require('@actions/github');

(async () => {
  const github = new GitHub(process.env.GITHUB_TOKEN);
  const { owner, repo } = context.repo;

  console.log(JSON.stringify(context, null, 4));

  // await github.repos.createRelease({
  //   owner,
  //   repo,
  //   tag_name: `v${newVersion}`,
  //   name: `v${newVersion}`,
  //   body: releaseNotes,
  // });
})();
