/***********************************************************************************************************************

	util/encodemarkup.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/

/*
	Returns an entity encoded version of the given string.

	NOTE: Escapes the five primary HTML special characters, the backquote,
	and SugarCube markup metacharacters.
*/
var encodeMarkup = (() => { // eslint-disable-line no-unused-vars, no-var
	const markupCharsRE    = /[!"#$&'*\-/<=>?@[\\\]^_`{|}~]/g;
	const hasMarkupCharsRE = new RegExp(markupCharsRE.source); // to drop the global flag
	const markupCharsTable = new Map([
		['!',  '&#33;'],
		['"',  '&quot;'],
		['#',  '&#35;'],
		['$',  '&#36;'],
		['&',  '&amp;'],
		["'",  '&#39;'],
		['*',  '&#42;'],
		['-',  '&#45;'],
		['/',  '&#47;'],
		['<',  '&lt;'],
		['=',  '&#61;'],
		['>',  '&gt;'],
		['?',  '&#63;'],
		['@',  '&#64;'],
		['[',  '&#91;'],
		['\\', '&#92;'],
		[']',  '&#93;'],
		['^',  '&#94;'],
		['_',  '&#95;'],
		['`',  '&#96;'],
		['{',  '&#123;'],
		['|',  '&#124;'],
		['}',  '&#125;'],
		['~',  '&#126;']
	]);

	function encodeMarkup(str) {
		if (str == null) { // nullish test
			return '';
		}

		const val = String(str);
		return val && hasMarkupCharsRE.test(val)
			? val.replace(markupCharsRE, ch => markupCharsTable.get(ch))
			: val;
	}

	return encodeMarkup;
})();
