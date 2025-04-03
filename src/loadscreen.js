/***********************************************************************************************************************

	loadscreen.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global Config, Engine, triggerEvent */

var LoadScreen = (() => { // eslint-disable-line no-unused-vars, no-var
	// Locks collection.
	const locks = new Set();

	// Auto-incrementing lock ID.
	let lockId = 0;


	/*******************************************************************************
		LoadScreen Functions.
	*******************************************************************************/

	/*
		Initialize management of the loading screen.
	*/
	function init() {
		if (BUILD_DEBUG) { console.log('[LoadScreen/init()]'); }

		// Add a `readystatechange` listener for hiding/showing the loading screen.
		jQuery(document).on('readystatechange.SugarCube', () => {
			if (BUILD_DEBUG) { console.log(`[LoadScreen/<readystatechange>] document.readyState: "${document.readyState}"; locks(${locks.size}):`, locks); }

			if (locks.size > 0) {
				return;
			}

			// The value of `document.readyState` may be: 'loading' -> 'interactive' -> 'complete'.
			// Though, to reach this point, it must already be in, at least, the 'interactive' state.
			if (document.readyState === 'complete') {
				if (jQuery(document.documentElement).attr('data-init') === 'loading') {
					if (Config.loadDelay > 0) {
						setTimeout(() => {
							if (locks.size === 0) {
								hide();
							}
						}, Math.max(Engine.DOM_DELAY, Config.loadDelay));
					}
					else {
						hide();
					}
				}
			}
			else {
				show();
			}
		});
	}

	/*
		Clear the loading screen.
	*/
	function clear() {
		if (BUILD_DEBUG) { console.log('[LoadScreen/clear()]'); }

		// Remove the event listener.
		jQuery(document).off('readystatechange.SugarCube');

		// Clear all locks.
		locks.clear();

		// Hide the loading screen.
		hide();
	}

	/*
		Hide the loading screen.
	*/
	function hide() {
		if (BUILD_DEBUG) { console.log('[LoadScreen/hide()]'); }

		jQuery(document.documentElement).removeAttr('data-init');
	}

	/*
		Show the loading screen.
	*/
	function show() {
		if (BUILD_DEBUG) { console.log('[LoadScreen/show()]'); }

		jQuery(document.documentElement).attr('data-init', 'loading');
	}

	/*
		Returns a new lock ID after locking and showing the loading screen.
	*/
	function lock() {
		if (BUILD_DEBUG) { console.log('[LoadScreen/lock()]'); }

		++lockId;
		locks.add(lockId);

		if (BUILD_DEBUG) { console.log(`\tacquired loading screen lock; id: ${lockId}`); }

		show();
		return lockId;
	}

	/*
		Remove the lock associated with the given lock ID and, if no locks remain,
		trigger a `readystatechange` event.
	*/
	function unlock(id) {
		if (BUILD_DEBUG) { console.log(`[LoadScreen/unlock(id: ${id})]`); }

		if (id == null) { // nullish test
			throw new TypeError('id parameter must not be null or undefined');
		}

		if (locks.has(id)) {
			locks.delete(id);

			if (BUILD_DEBUG) { console.log(`\treleased loading screen lock; id: ${id}`); }
		}

		if (locks.size === 0) {
			triggerEvent('readystatechange');
		}
	}

	/*
		Returns the current number of locks.
	*/
	function size() {
		return locks.size;
	}


	/*******************************************************************************
		Object Exports.
	*******************************************************************************/

	return Object.preventExtensions(Object.create(null, {
		init   : { value : init },
		clear  : { value : clear },
		hide   : { value : hide },
		show   : { value : show },
		lock   : { value : lock },
		unlock : { value : unlock },
		size   : { get : size }
	}));
})();
