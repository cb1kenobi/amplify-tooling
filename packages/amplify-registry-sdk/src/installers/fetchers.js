import pacote from 'pacote';

import { cacheDir } from './common';
import { createRequestOptions } from '@axway/amplify-cli-utils';
import { download } from 'targit';
import { existsSync } from 'fs';
import { join } from 'path';

export default async function fetchPackage(pkgInfo) {
	let downloadLocation;

	switch (pkgInfo.dist.download_type) {
		case 'npm':
			let { name, version } = pkgInfo;
			const opts = createRequestOptions();

			if (pkgInfo.dist.registry_url) {
				opts.registry = pkgInfo.dist.registry_url;
			}

			if (!version) {
				version = 'latest';
			}

			const pkg = await pacote.manifest(`${name}@${version}`, opts);

			if (version === 'latest') {
				version = pkg.version;
			}

			downloadLocation = join(cacheDir, 'npm', name, version, 'package.tgz');

			if (!existsSync(downloadLocation)) {
				await pacote.tarball.file(`${name}@${version}`, downloadLocation, opts);
			}
			break;

		case 'git':
			downloadLocation = await download(pkgInfo.dist.download_url, { cacheDir: join(cacheDir, 'git') });
			break;

		default:
			throw new Error('Unsupported package type');
	}

	return downloadLocation;
}
