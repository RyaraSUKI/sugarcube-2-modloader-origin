/*
	`SCDocs` SETUP
*/
(() => {
	'use strict';

	const hasWebStorage = function (storeId) {
		try {
			const store = window[storeId];
			const tid   = `_scd_${String(Date.now())}`;
			store.setItem(tid, tid);
			const result = store.getItem(tid) === tid;
			store.removeItem(tid);
			return result;
		}
		catch (ex) { /* no-op */ }

		return false;
	};

	if (
		   !document.head
		|| !document.addEventListener
		|| !document.querySelector
		|| !Array.prototype.indexOf
		|| !Object.defineProperties
		|| !hasWebStorage('localStorage')
	) {
		return;
	}

	const storageKey = 'sugarcube-v2-docs-cfg';
	const SCDocs = Object.freeze(Object.create(null, {
		getConfig : {
			value(key) {
				const json = localStorage.getItem(storageKey);

				if (json) {
					try {
						const config = JSON.parse(json);

						if (config !== null && typeof config === 'object' && config.hasOwnProperty(key)) {
							return config[key];
						}
					}
					catch (ex) { /* no-op */ }
				}

				return undefined;
			}
		},
		setConfig : {
			value(key, value) {
				let config;

				try {
					config = JSON.parse(localStorage.getItem(storageKey));
				}
				catch (ex) { /* no-op */ }

				if (config === null || typeof config !== 'object') {
					config = {};
				}

				config[key] = value;

				try {
					localStorage.setItem(storageKey, JSON.stringify(config));
					return true;
				}
				catch (ex) { /* no-op */ }

				return false;
			}
		},
		removeConfig : {
			value(key) {
				const json = localStorage.getItem(storageKey);

				if (json) {
					try {
						const config = JSON.parse(json);

						if (config !== null && typeof config === 'object' && config.hasOwnProperty(key)) {
							delete config[key];

							if (Object.keys(config).length > 0) {
								localStorage.setItem(storageKey, JSON.stringify(config));
							}
							else {
								localStorage.removeItem(storageKey);
							}
						}

						return true;
					}
					catch (ex) { /* no-op */ }
				}

				return false;
			}
		},
		clearConfig : {
			value() {
				localStorage.removeItem(storageKey);
				return true;
			}
		},
		arrayFrom : {
			value(arrayLike) {
				return Array.prototype.slice.call(arrayLike);
			}
		}
	}));
	Object.defineProperty(window, 'SCDocs', {
		value : SCDocs
	});
})();
