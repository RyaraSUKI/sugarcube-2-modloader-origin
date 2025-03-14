/***********************************************************************************************************************

	storage/adapters/cookie.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global Serial, SimpleStore, exceptionFrom */

SimpleStore.adapters.push((() => {
	// Expiry constants.
	const MAX_EXPIRY = 'Tue, 19 Jan 2038 03:14:07 GMT'; // (new Date((Math.pow(2, 31) - 1) * 1000)).toUTCString()
	const MIN_EXPIRY = 'Thu, 01 Jan 1970 00:00:00 GMT'; // (new Date(0)).toUTCString()

	// Adapter readiness state.
	let ok = false;


	/*******************************************************************************
		CookieAdapter Class.
	*******************************************************************************/

	class CookieAdapter {
		// Private fields.
		#prefix;   // Our database prefix.
		#prefixRE; // The regular expression that matches our prefix.

		// Public fields.
		name;       // Our name.
		id;         // Our storage ID.
		persistent; // Are we a persistent store?


		constructor(storageId, persistent) {
			const prefix = `${storageId}${persistent ? '!' : '*'}.`;

			this.#prefix   = prefix;
			this.#prefixRE = new RegExp(`^${RegExp.escape(prefix)}`);

			Object.defineProperties(this, {
				name : {
					value : 'cookie'
				},

				id : {
					value : storageId
				},

				persistent : {
					value : Boolean(persistent)
				}
			});
		}


		// Public methods.

		get size() {
			if (BUILD_DEBUG) { console.log(`[<SimpleStore:${this.name}>.size : Number]`); }

			return this.keys().length;
		}

		keys() {
			if (BUILD_DEBUG) { console.log(`[<SimpleStore:${this.name}>.keys() : String Array]`); }

			if (document.cookie === '') {
				return [];
			}

			const cookies = document.cookie.split(/;\s*/);
			const keys    = [];

			for (let i = 0; i < cookies.length; ++i) {
				const kvPair = cookies[i].split('=');
				const key    = decodeURIComponent(kvPair[0]);

				if (this.#prefixRE.test(key)) {
					// NOTE: All stored values are serialized and an empty string will
					// always serialize to a non-empty string.  Therefore, receiving an
					// empty string here denotes a deleted value rather than a serialized
					// empty string, so we omit such pairs.
					const value = decodeURIComponent(kvPair[1]);

					if (value !== '') {
						keys.push(key.replace(this.#prefixRE, ''));
					}
				}
			}

			return keys;
		}

		has(key) {
			if (BUILD_DEBUG) { console.log(`[<SimpleStore:${this.name}>.has(key: "${key}") : Boolean]`); }

			if (typeof key !== 'string' || !key) {
				return false;
			}

			return CookieAdapter.#getCookie(this.#prefix + key) !== null;
		}

		get(key) {
			if (BUILD_DEBUG) { console.log(`[<SimpleStore:${this.name}>.get(key: "${key}") : Any]`); }

			if (typeof key !== 'string' || !key) {
				return null;
			}

			const value = CookieAdapter.#getCookie(this.#prefix + key);

			return value === null ? null : CookieAdapter.#deserialize(value);
		}

		set(key, value) {
			if (BUILD_DEBUG) { console.log(`[<SimpleStore:${this.name}>.set(key: "${key}", value: \u2026) : Boolean]`); }

			if (typeof key !== 'string' || !key) {
				return false;
			}

			try {
				CookieAdapter.#setCookie(
					this.#prefix + key,
					CookieAdapter.#serialize(value),

					// An undefined expiry denotes a session cookie.
					this.persistent ? MAX_EXPIRY : undefined
				);

				if (!this.has(key)) {
					throw new Error('unknown validation error during set');
				}
			}
			catch (ex) {
				// Massage the cookie exception into something a bit nicer for the player.
				throw exceptionFrom(ex, Error, {
					cause   : { origin : ex },
					message : `cookie error: ${ex.message}`
				});
			}

			return true;
		}

		delete(key) {
			if (BUILD_DEBUG) { console.log(`[<SimpleStore:${this.name}>.delete(key: "${key}") : Boolean]`); }

			// Attempting to delete a cookie implies setting it, so we test for its existence
			// beforehand, to avoid creating it in the event that it does not already exist.
			if (typeof key !== 'string' || !key || !this.has(key)) {
				return false;
			}

			try {
				CookieAdapter.#setCookie(
					this.#prefix + key,

					// Use `undefined` as the value.
					undefined,

					// Use the epoch as the expiry.
					MIN_EXPIRY
				);

				if (this.has(key)) {
					throw new Error('unknown validation error during delete');
				}
			}
			catch (ex) {
				// Massage the cookie exception into something a bit nicer for the player.
				throw exceptionFrom(ex, Error, {
					cause   : { origin : ex },
					message : `cookie error: ${ex.message}`
				});
			}

			return true;
		}

		clear() {
			if (BUILD_DEBUG) { console.log(`[<SimpleStore:${this.name}>.clear() : Boolean]`); }

			const keys = this.keys();

			for (let i = 0, length = keys.length; i < length; ++i) {
				if (BUILD_DEBUG) { console.log('\tdeleting key:', keys[i]); }

				this.delete(keys[i]);
			}

			return true;
		}


		// Static private methods.

		static #getCookie(prefixedKey) {
			if (!prefixedKey || document.cookie === '') {
				return null;
			}

			const cookies = document.cookie.split(/;\s*/);

			for (let i = 0; i < cookies.length; ++i) {
				const kvPair = cookies[i].split('=');
				const key    = decodeURIComponent(kvPair[0]);

				if (prefixedKey === key) {
					const value = decodeURIComponent(kvPair[1]);

					// NOTE: All stored values are serialized and an empty string will
					// always serialize to a non-empty string.  Therefore, receiving an
					// empty string here denotes a deleted value rather than a serialized
					// empty string, so we return `null` for such pairs.
					return value || null;
				}
			}

			return null;
		}

		static #setCookie(prefixedKey, value, expiry) {
			if (!prefixedKey) {
				return;
			}

			let payload = `${encodeURIComponent(prefixedKey)}=`;

			if (value != null) { // nullish test
				payload += encodeURIComponent(value);
			}

			if (expiry != null) { // nullish test
				payload += `; expires=${expiry}`;
			}

			payload += '; path=/';
			document.cookie = payload;
		}

		static #serialize(obj) {
			return LZString.compressToBase64(Serial.stringify(obj));
		}

		static #deserialize(str) {
			return Serial.parse(LZString.decompressFromBase64(str));
		}
	}


	/*******************************************************************************
		Adapter Utility Functions.
	*******************************************************************************/

	function create(storageId, persistent) {
		if (!ok) {
			throw new Error('adapter not initialized');
		}

		return new CookieAdapter(storageId, persistent);
	}

	function init() {
		// Cookie feature test.
		try {
			function getCookie(prefixedKey) {
				if (!prefixedKey || document.cookie === '') {
					return null;
				}

				const cookies = document.cookie.split(/;\s*/);

				for (let i = 0; i < cookies.length; ++i) {
					const kvPair = cookies[i].split('=');
					const key    = decodeURIComponent(kvPair[0]);

					if (prefixedKey === key) {
						const value = decodeURIComponent(kvPair[1]);

						// NOTE: All stored values are serialized and an empty string will
						// always serialize to a non-empty string.  Therefore, receiving an
						// empty string here denotes a deleted value rather than a serialized
						// empty string, so we return `null` for such pairs.
						return value || null;
					}
				}

				return null;
			}

			function setCookie(prefixedKey, value, expiry) {
				if (!prefixedKey) {
					return;
				}

				let payload = `${encodeURIComponent(prefixedKey)}=`;

				if (value != null) { // nullish test
					payload += encodeURIComponent(value);
				}

				if (expiry != null) { // nullish test
					payload += `; expires=${expiry}`;
				}

				payload += '; path=/';
				document.cookie = payload;
			}

			const tid = `_sc_${String(Date.now())}`;

			// We only test a session cookie as that should suffice.
			setCookie(tid, LZString.compressToBase64(Serial.stringify(tid)), undefined);
			ok = Serial.parse(LZString.decompressFromBase64(getCookie(tid))) === tid;
			setCookie(tid, undefined, MIN_EXPIRY);
		}
		catch (ex) {
			ok = false;
		}

		return ok;
	}


	/*******************************************************************************
		Object Exports.
	*******************************************************************************/

	return Object.preventExtensions(Object.create(null, {
		init   : { value : init },
		create : { value : create }
	}));
})());
