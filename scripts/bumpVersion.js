#!/usr/bin/env node
/* eslint import/no-dynamic-require: 0, no-console: 0 */
const path = require('path');
const shell = require('shelljs');

// Example: `Icon: Adding story pin icon #minor (#842)`
const lastCommitMessage =
  'Icon: Adding story pin icon #minor (#842)' ||
  shell.exec('git log -n1 --pretty=format:"%s"', {
    silent: true,
  }).stdout;

// Don't bump the version when the commit starts with `Version bump:`
if (lastCommitMessage.startsWith('Version bump:')) {
  return;
}

// Define the version bump type depending on the hashtag in the commit: #patch / #minor / #major. Default is #patch
const types = ['patch', 'minor', 'major'];
const versionType =
  types.find(type => lastCommitMessage.includes(`#${type}`)) || 'patch';

// Bump the gestalt version number without creating a tag
shell.cd(path.join(__dirname, '..', 'packages', 'gestalt'));
shell.exec(
  `yarn version --${versionType} --no-git-tag-version --no-commit-hooks`
);

console.log(versionType);

// const versionType = 'patch';
// if (lastCommitMessage.includes('#patch')) {

// }

// const dogSwitch = (breed) => ({
//   "border": "Border Collies are good boys and girls.",
//   "pitbull": "Pit Bulls are good boys and girls.",
//   "german": "German Shepherds are good boys and girls."
// })[breed] || "Default choice";

// const

// const json = require(path.join(
//   __dirname,
//   '..',
//   'packages',
//   'gestalt',
//   'package.json'
// ));
// const { version } = json;
// console.log(`Publishing version: ${version}`);

// // Publish command to post to npm - must be run in the same directory as the gestalt package
// shell.cd(path.join(__dirname, '..', 'packages', 'gestalt'));
// shell.exec(
//   `yarn publish --registry=https://registry.npmjs.org --no-git-tag-version --new-version ${version}`
// );

// // Creates a new tag on GitHub for record keeping
// shell.exec(`git tag v${version}`);
// shell.exec(`git push upstream tags/v${version}`);

// // Script to publish the docs - must be run from the home directory
// shell.cd(path.join(__dirname, '..'));
// shell.exec('./scripts/ghpages.sh');
