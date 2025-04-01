/*
	PAGE ENHANCEMENT
*/
/* globals SCDocs */
(() => {
	'use strict';

	if (!('SCDocs' in window)) {
		return;
	}

	// Restore user settings.
	const codeColor = SCDocs.getConfig('codeColor');

	if (codeColor === 'inherit') {
		document.documentElement.classList.add('disable-code-color');
	}

	// Outline patching.
	const outlineStyle = (() => {
		const style = document.createElement('style');
		style.setAttribute('id', 'style-aria-outlines');
		style.setAttribute('type', 'text/css');
		document.head.appendChild(style);
		return style;
	})();
	let lastOutlineEvent;
	const outlineToggleFn = ev => {
		if (ev.type !== lastOutlineEvent) {
			lastOutlineEvent = ev.type;
			// Clear styles for IE ≤10.
			if (outlineStyle.styleSheet) {
				outlineStyle.styleSheet.cssText = '';
			}
			// Clear styles for all other browsers (incl. IE ≥11).
			else {
				while (outlineStyle.firstChild) {
					outlineStyle.removeChild(outlineStyle.firstChild);
				}
			}
			if (ev.type === 'mousedown') {
				const rule = '*:focus{outline:none;}';
				// For IE ≤ 10.
				if (outlineStyle.styleSheet) {
					outlineStyle.styleSheet.cssText += rule;
				}
				// For all other browsers (incl. IE ≥ 11).
				else {
					outlineStyle.appendChild(document.createTextNode(rule));
				}
			}
		}
	};
	document.addEventListener('keydown', outlineToggleFn);
	document.addEventListener('mousedown', outlineToggleFn);
})();
