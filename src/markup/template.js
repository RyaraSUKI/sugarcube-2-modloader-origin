/***********************************************************************************************************************

	markup/template.js

	Copyright © 2019–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global Patterns */

var Template = (() => { // eslint-disable-line no-unused-vars, no-var
	// Template definitions.
	const templates = new Map();

	// Valid template name regular expression.
	const validNameRE = new RegExp(`^(?:${Patterns.templateName})$`);

	// Valid template type predicate.
	const validType = template => {
		const templateType = typeof template;
		return templateType === 'function' || templateType === 'string';
	};


	/*******************************************************************************
		Template Functions.
	*******************************************************************************/

	function templateAdd(name, template) {
		if (
			!validType(template)
			&& !(template instanceof Array && template.length > 0 && template.every(validType))
		) {
			throw new TypeError(`invalid template type (${name}); templates must be: functions, strings, or an array of either`);
		}

		(name instanceof Array ? name : [name]).forEach(name => {
			if (!validNameRE.test(name)) {
				throw new Error(`invalid template name "${name}"`);
			}
			if (templates.has(name)) {
				throw new Error(`cannot clobber existing template ?${name}`);
			}

			templates.set(name, template);
		});
	}

	function templateDelete(name) {
		(name instanceof Array ? name : [name]).forEach(name => templates.delete(name));
	}

	function templateGet(name) {
		return templates.has(name) ? templates.get(name) : null;
	}

	function templateHas(name) {
		return templates.has(name);
	}

	function templateSize() {
		return templates.size;
	}


	/*******************************************************************************
		Object Exports.
	*******************************************************************************/

	return Object.preventExtensions(Object.create(null, {
		add    : { value : templateAdd },
		delete : { value : templateDelete },
		get    : { value : templateGet },
		has    : { value : templateHas },
		size   : { get : templateSize }
	}));
})();
