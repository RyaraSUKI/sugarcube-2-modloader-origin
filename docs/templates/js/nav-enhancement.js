/*
	NAV ENHANCEMENT
*/
/* globals SCDocs */
(() => {
	'use strict';

	if (!('SCDocs' in window)) {
		return;
	}

	const storageKey = 'navExpanded';
	const expanded   = Object.freeze(Object.create(null, {
		_ARRAY : {
			value : SCDocs.getConfig(storageKey) || []
		},
		add : {
			value(listId) {
				if (this._ARRAY.indexOf(listId) === -1) {
					this._ARRAY.push(listId);
					SCDocs.setConfig(storageKey, this._ARRAY);
				}
			}
		},
		delete : {
			value(listId) {
				const pos = this._ARRAY.indexOf(listId);

				if (pos !== -1) {
					this._ARRAY.splice(pos, 1);

					if (this._ARRAY.length > 0) {
						SCDocs.setConfig(storageKey, this._ARRAY);
					}
					else {
						SCDocs.removeConfig(storageKey);
					}
				}
			}
		},
		has : {
			value(listId) {
				return this._ARRAY.indexOf(listId) !== -1;
			}
		}
	}));

	const createListToggle = (list, isExpanded) => {
		const collapseTitle = 'Collapse section';
		const expandTitle   = 'Expand section';
		const toggleFn      = ev => {
			if (
				   ev.type === 'click'
				|| ev.type === 'keydown' && (ev.key === 'Enter' || ev.key === ' ' /* space */)
			) {
				ev.preventDefault();
				const toggle = ev.target;

				if (list.classList.contains('collapsed')) {
					list.classList.remove('collapsed');
					toggle.classList.remove('collapsed');
					toggle.setAttribute('title', collapseTitle);
					toggle.setAttribute('aria-label', collapseTitle);
					expanded.add(list.id);
				}
				else {
					list.classList.add('collapsed');
					toggle.classList.add('collapsed');
					toggle.setAttribute('title', expandTitle);
					toggle.setAttribute('aria-label', expandTitle);
					expanded.delete(list.id);
				}
			}
		};
		const toggle = document.createElement('a');
		toggle.classList.add('list-toggle');

		if (isExpanded) {
			toggle.setAttribute('title', collapseTitle);
			toggle.setAttribute('aria-label', collapseTitle);
		}
		else {
			list.classList.add('collapsed');
			toggle.classList.add('collapsed');
			toggle.setAttribute('title', expandTitle);
			toggle.setAttribute('aria-label', expandTitle);
		}

		toggle.setAttribute('tabindex', 0);
		toggle.addEventListener('click', toggleFn);
		toggle.addEventListener('keydown', toggleFn);
		return toggle;
	};
	const nav     = document.querySelector('nav');
	const lists   = SCDocs.arrayFrom(nav.querySelectorAll('nav>ul'));
	const toggles = [];
	lists.forEach(list => {
		let heading = list.previousSibling;

		while (heading !== null && heading.nodeType !== Node.ELEMENT_NODE && heading.nodeName !== 'H2') {
			heading = heading.previousSibling;
		}

		if (heading) {
			let anchor = heading.firstChild;

			while (anchor) {
				if (anchor.nodeType === Node.ELEMENT_NODE && anchor.nodeName === 'A') {
					break;
				}

				anchor = anchor.nextSibling;
			}

			const listId = `nav-${anchor.href.replace(/^.*#([^#]+)$/, '$1')}`;
			list.setAttribute('id', listId);
			const toggle = createListToggle(list, expanded.has(listId));
			toggles.push(toggle);
			heading.appendChild(toggle);
		}
	});

	const createColorToggle = () => {
		const disableTitle = 'Disable code color';
		const enableTitle  = 'Enable code color';
		const toggleFn     = ev => {
			if (
				   ev.type === 'click'
				|| ev.type === 'keydown' && (ev.key === 'Enter' || ev.key === ' ' /* space */)
			) {
				ev.preventDefault();
				const button = ev.target;

				if (button.classList.contains('disabled')) {
					button.classList.remove('disabled');
					button.setAttribute('title', disableTitle);
					button.setAttribute('aria-label', disableTitle);
					SCDocs.removeConfig('codeColor');
					document.documentElement.classList.remove('disable-code-color');
				}
				else {
					button.classList.add('disabled');
					button.setAttribute('title', enableTitle);
					button.setAttribute('aria-label', enableTitle);
					SCDocs.setConfig('codeColor', 'inherit');
					document.documentElement.classList.add('disable-code-color');
				}
			}
		};
		const button = document.createElement('button');
		button.setAttribute('id', 'color-toggle');
		button.appendChild(document.createTextNode('Code Color'));

		if (SCDocs.getConfig('codeColor') === 'inherit') {
			button.classList.add('disabled');
			button.setAttribute('title', enableTitle);
			button.setAttribute('aria-label', enableTitle);
		}
		else {
			button.setAttribute('title', disableTitle);
			button.setAttribute('aria-label', disableTitle);
		}

		button.setAttribute('tabindex', 0);
		button.addEventListener('click', toggleFn);
		button.addEventListener('keydown', toggleFn);
		return button;
	};

	const createListToggleAll = (toggles, name, predicate) => {
		const createEvent = type => {
			let event;

			if (typeof Event === 'function') {
				event = new Event(type);
			}
			else {
				event = document.createEvent('Event');
				event.initEvent(type);
			}

			return event;
		};
		const toggleFn = function (ev) {
			if (
				   ev.type === 'click'
				|| ev.type === 'keydown' && (ev.key === 'Enter' || ev.key === ' ' /* space */)
			) {
				ev.preventDefault();

				toggles.forEach(toggle => {
					if (predicate(toggle)) {
						toggle.dispatchEvent(createEvent('click'));
					}
				});
			}
		};
		const title  = `${name} all`;
		const toggle = document.createElement('a');
		toggle.setAttribute('id', `lists-${name.toLowerCase()}`);
		toggle.setAttribute('title', title);
		toggle.setAttribute('aria-label', title);
		toggle.setAttribute('tabindex', 0);
		toggle.addEventListener('click', toggleFn);
		toggle.addEventListener('keydown', toggleFn);
		return toggle;
	};
	const header = nav.querySelector('nav>header');
	const tray   = document.createElement('div');
	tray.setAttribute('id', 'controls');
	tray.appendChild(createColorToggle());
	tray.appendChild(createListToggleAll(toggles, 'Collapse', toggle => !toggle.classList.contains('collapsed')));
	tray.appendChild(createListToggleAll(toggles, 'Expand', toggle => toggle.classList.contains('collapsed')));
	header.appendChild(tray);
	nav.classList.add('enhanced');
})();
