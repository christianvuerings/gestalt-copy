#!/usr/bin/env node
/* eslint import/no-dynamic-require: 0, no-console: 0 */
const path = require('path');
const shell = require('shelljs');
const semver = require('semver');
const fsPromises = require('fs').promises;

const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');

const packageJSON = path.join(
  __dirname,
  '..',
  'packages',
  'gestalt',
  'package.json'
);
const packageJSONParsed = require(packageJSON);

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function getLastCommitMessage() {
  // Example: `Icon: Adding story pin icon #minor (#842)`
  return (
    // TODO Remove
    'Icon: Adding story pin icon #minor (#842)' ||
    shell.exec('git log -n1 --pretty=format:"%s"', {
      silent: true,
    }).stdout
  );
}

async function getReleaseNotes({ lastCommitMessage, newVersion, releaseType }) {
  // Format date: "May 7, 2020"
  const date = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return `## ${newVersion} (${date})

  ### ${capitalizeFirstLetter(releaseType)}

  - ${lastCommitMessage}`;
}

async function bumpPackageVersion({ lastCommitMessage }) {
  // Define the version bump type depending on the hashtag in the commit: #patch / #minor / #major. Default is #patch
  const types = ['patch', 'minor', 'major'];
  const releaseType =
    types.find(type => lastCommitMessage.toLowerCase().includes(`#${type}`)) ||
    'patch';

  // Previous version
  const { version: previousVersion } = packageJSONParsed;

  // Bump gestalt version number
  const newVersion = semver.inc(previousVersion, releaseType);
  packageJSONParsed.version = newVersion;

  await fsPromises.writeFile(
    packageJSON,
    `${JSON.stringify(packageJSONParsed, null, 2)}\n`
  );

  console.log(`Previous version: ${previousVersion}`);
  console.log(`New version: ${newVersion}`);

  return { newVersion, releaseType };
}

async function updateChangelog({ releaseNotes }) {
  const changelogPath = './CHANGELOG.md';
  const previousChangelog = await fsPromises.readFile(changelogPath, {
    encoding: 'utf8',
  });

  await fsPromises.writeFile(
    changelogPath,
    `${releaseNotes}

${previousChangelog}`
  );
}

async function commitChanges({ newVersion }) {
  shell.exec('git add .');
  shell.exec(`git commit -am "Version bump: v${newVersion}"`);
}

async function createGitHubRelease({ newVersion, releaseNotes }) {
  const github = new GitHub(process.env.GITHUB_TOKEN);
  const { owner, repo } = context.repo;

  const createReleaseResponse = await github.repos.createRelease({
    owner,
    repo,
    tag_name: `v${newVersion}`,
    name: `v${newVersion}`,
    body: releaseNotes,
  });

  const {
    data: { id: releaseId, html_url: htmlUrl, upload_url: uploadUrl },
  } = createReleaseResponse;

  console.log('id', releaseId);
  console.log('html_url', htmlUrl);
  console.log('upload_url', uploadUrl);
}

(async () => {
  console.log('Running Gestalt Release Steps');
  const lastCommitMessage = await getLastCommitMessage();
  const { newVersion, releaseType } = await bumpPackageVersion({
    lastCommitMessage,
  });
  const releaseNotes = await getReleaseNotes({
    lastCommitMessage,
    newVersion,
    releaseType,
  });
  await updateChangelog({ releaseNotes });
  // await commitChanges({ newVersion });
  // await createGitHubRelease({ newVersion, releaseNotes });

  // Export new version so it can be used by other steps
  core.exportVariable('VERSION', newVersion);
})();
