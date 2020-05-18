#!/usr/bin/env node
const { GitHub, context } = require('@actions/github');

(async () => {
  const github = new GitHub(process.env.GITHUB_TOKEN);
  const { owner, repo } = context.repo;

  await github.issues.addLabels({
    owner,
    repo,
    issue_number: context.payload.number,
    labels: ['patch release'],
  });
})();
