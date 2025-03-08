/***********************************************************************************************************************

	util/hasblockcontext.js

	Copyright © 2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/

/*
	Returns whether the given nodes have a block context.

	TODO: Update the list of default block-level elements (below) as necessary.
	Last checked: Apr 2020.
*/
var hasBlockContext = (() => { // eslint-disable-line no-unused-vars, no-var
	const localGetComputedStyle = (() => {
		if (typeof window.getComputedStyle === 'function') {
			return window.getComputedStyle;
		}

		// For IE and Opera (Presto).
		return function (element /* , pseudoEl */) {
			if (!element) {
				throw new TypeError('element parameter must be an Element object');
			}

			return element.currentStyle;
		};
	})();

	function hasBlockContext(nodes) { // eslint-disable-line no-unused-vars
		for (let i = nodes.length - 1; i >= 0; --i) {
			const node = nodes[i];

			switch (node.nodeType) {
				case Node.ELEMENT_NODE: {
					const tagName = node.nodeName.toUpperCase();

					if (tagName === 'BR') {
						return true;
					}

					const styles = localGetComputedStyle(node);

					if (styles && styles.display) {
						if (styles.display === 'none') {
							continue;
						}

						return styles.display === 'block';
					}

					// NOTE: WebKit/Blink-based browsers do not attach any computed
					// style information to elements until they're inserted into the
					// DOM (and probably visible), not even the default browser styles
					// and any user styles.  So, we make an assumption based on the
					// element.
					switch (tagName) {
						case 'ADDRESS':
						case 'ARTICLE':
						case 'ASIDE':
						case 'BLOCKQUOTE':
						case 'CENTER':
						case 'DIV':
						case 'DL':
						case 'FIGURE':
						case 'FOOTER':
						case 'FORM':
						case 'H1':
						case 'H2':
						case 'H3':
						case 'H4':
						case 'H5':
						case 'H6':
						case 'HEADER':
						case 'HR':
						case 'MAIN':
						case 'NAV':
						case 'OL':
						case 'P':
						case 'PRE':
						case 'SECTION':
						case 'TABLE':
						case 'UL':
							return true;
					}

					return false;
				}

				case Node.COMMENT_NODE:
					continue;

				default:
					return false;
			}
		}

		return true;
	}

	return hasBlockContext;
})();
