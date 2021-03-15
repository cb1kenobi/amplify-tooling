export default {
	aliases: [ 'ls' ],
	args: [
		{
			name: 'org',
			desc: 'The organization name, id, or guid; defaults to the current org'
		}
	],
	desc: 'Lists organization teams',
	options: {
		'--account [name]': 'The account to use',
		'--json': 'Outputs accounts as JSON'
	},
	async action({ argv, console }) {
		const { initPlatformAccount } = require('../lib/util');
		const { createTable } = require('@axway/amplify-cli-utils');
		const { default: snooplogg } = require('snooplogg');
		const { account, org, sdk } = await initPlatformAccount(argv.account, argv.org);
		const teams = await sdk.team.list(account, org.id);

		if (argv.json) {
			console.log(JSON.stringify(teams, null, 2));
			return;
		}

		const { green, highlight, note } = snooplogg.styles;
		console.log(`Account:      ${highlight(account.name)}`);
		console.log(`Organization: ${highlight(org.name)} ${note(`(${org.guid})`)}\n`);

		if (!teams.length) {
			console.log('No teams found');
			return;
		}

		const table = createTable([ 'Name', 'Description', 'GUID', 'Members', 'Apps', 'Date Created' ]);
		const check = process.platform === 'win32' ? '√' : '✔';

		for (const { apps, created, default: def, desc, guid, name, users } of teams) {
			table.push([
				def ? green(`${check} ${name}`) : `  ${name}`,
				desc || note('n/a'),
				guid,
				users.length,
				apps.length,
				new Date(created).toLocaleDateString()
			]);
		}
		console.log(table.toString());
	}
};