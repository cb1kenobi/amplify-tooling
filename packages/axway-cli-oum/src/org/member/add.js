export default {
	args: [
		{
			name: 'org',
			desc: 'The organization name, id, or guid',
			required: true
		},
		{
			name: 'user',
			desc: 'The user guid or email address',
			required: true
		}
	],
	desc: 'Add a new member to an organization',
	options: {
		'--account [name]': 'The platform account to use',
		'--json': 'Outputs accounts as JSON',
		'--role [role]': {
			desc: 'Assign one or more team roles to a member',
			multiple: true,
			required: true
		}
	},
	async action({ argv, cli, console }) {
		const { initPlatformAccount } = require('../../lib/util');
		let { account, org, sdk } = await initPlatformAccount(argv.account, argv.org);
		const { default: snooplogg } = require('snooplogg');
		const { highlight, note } = snooplogg.styles;

		if (!argv.json) {
			console.log(`Account:      ${highlight(account.name)}`);
			console.log(`Organization: ${highlight(org.name)} ${note(`(${org.guid})`)}\n`);
		}

		const { guid } = await sdk.org.addMember(account, org.id, argv.user, argv.role);
		const result = {
			account: account.name,
			org,
			user: await sdk.user.find(account, guid)
		};

		if (argv.json) {
			console.log(JSON.stringify(result, null, 2));
		} else {
			const name = `${result.user.firstname} ${result.user.lastname}`.trim();
			console.log(`Successfully added ${highlight(name)} to ${highlight(org.name)}`);
		}

		await cli.emitAction('axway:oum:org:member:add', result);
	}
};