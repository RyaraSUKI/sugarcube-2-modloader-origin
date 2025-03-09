/***********************************************************************************************************************

	lib/stylewrapper.js

	Copyright © 2013–2024 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global Patterns, Story, Wikifier */

/*******************************************************************************
	StyleWrapper Class.
*******************************************************************************/

class StyleWrapper { // eslint-disable-line no-unused-vars
	// Static private fields.
	static #imageMarkupRE    = new RegExp(Patterns.cssImage, 'g');
	static #hasImageMarkupRE = new RegExp(Patterns.cssImage);

	// Private fields.
	#styleEl;

	constructor(element) {
		if (element == null) { // nullish test
			throw new TypeError('element parameter must be an HTMLStyleElement instance');
		}

		this.#styleEl = element;
	}

	isEmpty() {
		// This should work in all supported browsers.
		return this.#styleEl.cssRules.length === 0;
	}

	set(rawCss) {
		this.clear();
		this.add(rawCss);
	}

	add(rawCss) {
		let css = rawCss;

		// Check for wiki image transclusion.
		if (StyleWrapper.#hasImageMarkupRE.test(css)) {
			// Ensure we have a good starting position.
			StyleWrapper.#imageMarkupRE.lastIndex = 0;

			css = css.replace(StyleWrapper.#imageMarkupRE, wikiImage => {
				const markup = Wikifier.helpers.parseSquareBracketedMarkup({
					source     : wikiImage,
					matchStart : 0
				});

				if (Object.hasOwn(markup, 'error') || markup.pos < wikiImage.length) {
					return wikiImage;
				}

				let source = markup.source;

				// Handle image passage transclusion.
				if (source.slice(0, 5) !== 'data:' && Story.has(source)) {
					const passage = Story.get(source);

					if (passage.tags.includes('Twine.image')) {
						source = passage.text.trim();
					}
				}

				// The source may be URI- or Base64-encoded, so we cannot use `encodeURIComponent()`
				// here.  Instead, we simply percent-encode any double quotes, since the URI will be
				// delimited by them.
				return `url("${source.replace(/"/g, '%22')}")`;
			});
		}

		// For IE ≤ 10.
		if (this.#styleEl.styleSheet) {
			this.#styleEl.styleSheet.cssText += css;
		}

		// For all other browsers (incl. IE ≥ 11).
		else {
			this.#styleEl.appendChild(document.createTextNode(css));
		}
	}

	clear() {
		// For IE ≤10.
		if (this.#styleEl.styleSheet) {
			this.#styleEl.styleSheet.cssText = '';
		}

		// For all other browsers (incl. IE ≥11).
		else {
			jQuery(this.#styleEl).empty();
		}
	}
}
