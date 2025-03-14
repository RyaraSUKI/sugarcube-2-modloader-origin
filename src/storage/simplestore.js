/***********************************************************************************************************************

	storage/simplestore.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/

var SimpleStore = (() => { // eslint-disable-line no-unused-vars, no-var
	// In-order list of database adapters.
	const adapters = [];

	// The initialized adapter.
	let initialized = null;


	/*******************************************************************************
		SimpleStore Functions.
	*******************************************************************************/

	function create(storageId, persistent) {
		if (initialized) {
			return initialized.create(storageId, persistent);
		}

		// Return the first adapter which successfully initializes, elsewise throw an exception.
		for (let i = 0; i < adapters.length; ++i) {
			if (adapters[i].init(storageId, persistent)) {
				initialized = adapters[i];
				return initialized.create(storageId, persistent);
			}
		}

		throw new Error('No valid storage adapters found');
	}


	/*******************************************************************************
		Object Exports.
	*******************************************************************************/

	return Object.preventExtensions(Object.create(null, {
		// Adapters List.
		//
		// QUESTION: Should this be a getter, rather than being exported directly?
		adapters : { value : adapters },

		// Core Functions.
		create : { value : create }
	}));
})();
