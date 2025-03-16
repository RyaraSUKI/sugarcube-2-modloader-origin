/***********************************************************************************************************************

	markup/wikifier.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/*
	global Config, Engine, Patterns, Scripting, State, Story, TempState, WikifierUtil,
	       convertBreaks, errorPrologRE, getTypeOf, hasBlockContext, isExternalLink
*/

/*
	TODO: The Wikifier, and associated code, could stand to receive a serious refactoring.
*/
/* eslint-disable max-len */
var Wikifier = (() => { // eslint-disable-line no-unused-vars, no-var
	// Wikifier call depth.
	//
	// TODO: Should `_callDepth` be a static field of `Wikifier`?
	let _callDepth = 0;


	/*******************************************************************************
		Wikifier Class.
	*******************************************************************************/

	class Wikifier {
		// Public fields.
		source;      // The source text to process.
		options;     // Our options.
		output;      // Our output element or document fragment.
		matchText;   // The current text that matched (the selected parser).
		matchLength; // The length of the current text match.
		matchStart;  // The starting position of the current text match.
		nextMatch;   // The current position of parser (approximately: matchStart + matchLength).

		// Private fields.
		/* legacy */
		#rawArgs = '';
		/* /legacy */

		// Static fields.
		// static Option; // To be added later.
		// static Parser; // To be added later.

		constructor(destination, source, options) {
			if (Wikifier.Parser.Profile.isEmpty()) {
				Wikifier.Parser.Profile.compile();
			}

			Object.defineProperties(this, {
				// General Wikifier properties.
				source : {
					value : String(source)
				},

				options : {
					writable : true,
					value    : Object.assign({
						profile : 'all'
					}, options)
				},

				nextMatch : {
					writable : true,
					value    : 0
				},

				output : {
					writable : true,
					value    : null
				}
			});

			// No destination specified.  Create a fragment to act as the output buffer.
			if (destination == null) { // nullish test
				this.output = document.createDocumentFragment();
			}

			// jQuery-wrapped destination.  Grab the first element.
			else if (destination instanceof jQuery) {
				this.output = destination[0];
			}

			// Normal destination.
			else {
				this.output = destination;
			}

			/*
				Wikify the source into the output buffer element, possibly converting line
				breaks into paragraphs.

				NOTE: There's no catch clause here because this try/finally exists solely
				to ensure that the call depth is properly restored in the event that an
				uncaught exception is thrown during the call to `subWikify()`.
			*/
			try {
				++_callDepth;

				this.subWikify(this.output);

				// Limit line break conversion to non-recursive calls.
				if (
					_callDepth === 1
					&& (
						Object.hasOwn(this.options, 'cleanup')
						&& this.options.cleanup != null // nullish test
							? this.options.cleanup
							: Config.cleanupWikifierOutput
					)
				) {
					convertBreaks(this.output);
				}
			}
			finally {
				--_callDepth;
			}
		}

		subWikify(output, terminator, options) {
			// Cache and temporarily replace the current output buffer.
			const oldOutput = this.output;
			this.output = output;

			let newOptions;
			let oldOptions;

			// Parser option overrides.
			if (Wikifier.Option.length > 0) {
				newOptions = Object.assign(newOptions || {}, Wikifier.Option.options);
			}
			// Local parameter option overrides.
			if (options !== null && typeof options === 'object') {
				newOptions = Object.assign(newOptions || {}, options);
			}
			// If new options exist, cache and temporarily replace the current options.
			if (newOptions) {
				oldOptions = this.options;
				this.options = Object.assign({}, this.options, newOptions);
			}

			const parsersProfile   = Wikifier.Parser.Profile.get(this.options.profile);
			const terminatorRegExp = terminator
				? new RegExp(`(?:${terminator})`, this.options.ignoreTerminatorCase ? 'gim' : 'gm')
				: null;
			let terminatorMatch;
			let parserMatch;

			do {
				// Prepare the RegExp match positions.
				parsersProfile.parserRegExp.lastIndex = this.nextMatch;

				if (terminatorRegExp) {
					terminatorRegExp.lastIndex = this.nextMatch;
				}

				// Get the first matches.
				parserMatch     = parsersProfile.parserRegExp.exec(this.source);
				terminatorMatch = terminatorRegExp ? terminatorRegExp.exec(this.source) : null;

				// Try for a terminator match, unless there's a closer parser match.
				if (terminatorMatch && (!parserMatch || terminatorMatch.index <= parserMatch.index)) {
					// Output any text before the match.
					if (terminatorMatch.index > this.nextMatch) {
						this.outputText(this.output, this.nextMatch, terminatorMatch.index);
					}

					// Set the match parameters.
					this.matchStart  = terminatorMatch.index;
					this.matchLength = terminatorMatch[0].length;
					this.matchText   = terminatorMatch[0];
					this.nextMatch   = terminatorRegExp.lastIndex;

					// Restore the original output buffer and options.
					this.output = oldOutput;

					if (oldOptions) {
						this.options = oldOptions;
					}

					// Exit.
					return;
				}

				// Try for a parser match.
				else if (parserMatch) {
					// Output any text before the match.
					if (parserMatch.index > this.nextMatch) {
						this.outputText(this.output, this.nextMatch, parserMatch.index);
					}

					// Set the match parameters.
					this.matchStart  = parserMatch.index;
					this.matchLength = parserMatch[0].length;
					this.matchText   = parserMatch[0];
					this.nextMatch   = parsersProfile.parserRegExp.lastIndex;

					// Figure out which parser matched.
					let matchingParser;

					for (let i = 1, pMLength = parserMatch.length; i < pMLength; ++i) {
						if (parserMatch[i]) {
							matchingParser = i - 1;
							break; // stop once we've found the matching parser
						}
					}

					// Call the parser.
					parsersProfile.parsers[matchingParser].handler(this);

					if (TempState.break != null) { // nullish test
						break;
					}
				}
			} while (terminatorMatch || parserMatch);

			// Output any text after the last match.
			if (TempState.break == null) { // nullish test
				if (this.nextMatch < this.source.length) {
					this.outputText(this.output, this.nextMatch, this.source.length);
					this.nextMatch = this.source.length;
				}
			}

			// In case of <<break>>/<<continue>>, remove the last <br>.
			else if (
				this.output.lastChild
				&& this.output.lastChild.nodeType === Node.ELEMENT_NODE
				&& this.output.lastChild.nodeName.toUpperCase() === 'BR'
			) {
				jQuery(this.output.lastChild).remove();
			}

			// Restore the original output buffer and options.
			this.output = oldOutput;

			if (oldOptions) {
				this.options = oldOptions;
			}
		}

		outputText(destination, startPos, endPos) {
			jQuery(destination).append(document.createTextNode(this.source.substring(startPos, endPos)));
		}

		/*
			[DEPRECATED] Meant to be called by legacy macros, this returns the raw, unprocessed
			text given to the currently executing macro.
		*/
		rawArgs() {
			console.warn('[DEPRECATED] Wikifier.rawArgs() is deprecated.');
			return this.#rawArgs;
		}
		get _deprecated_rawArgs_() { // eslint-disable-line camelcase
			// console.warn('[DEPRECATED] Wikifier.rawArgs is deprecated.');
			return this.#rawArgs;
		}
		set _deprecated_rawArgs_(value) { // eslint-disable-line camelcase
			// console.warn('[DEPRECATED] Wikifier.rawArgs is deprecated.');
			return this.#rawArgs += value;
		}

		/*
			[DEPRECATED] Meant to be called by legacy macros, this returns the text given to
			the currently executing macro after doing TwineScript to JavaScript desugaring.
		*/
		fullArgs() {
			console.warn('[DEPRECATED] Wikifier.fullArgs() is deprecated.');

			return Scripting.desugar(this.#rawArgs);
		}

		/*
			Returns the output generated by wikifying the given text, throwing if there were errors.
		*/
		static wikifyEval(text) {
			const output = document.createDocumentFragment();

			new Wikifier(output, text);

			const errors = output.querySelector('.error');

			if (errors !== null) {
				throw new Error(errors.textContent.replace(errorPrologRE, ''));
			}

			return output;
		}

		/*
			Create and return an internal link.
		*/
		static createInternalLink(destination, passage, text, callback) {
			const $link = jQuery(document.createElement('a'));

			if (passage != null) { // nullish test
				$link.attr('data-passage', passage);

				if (Story.has(passage)) {
					$link.addClass('link-internal');

					if (Config.addVisitedLinkClass && State.hasPlayed(passage)) {
						$link.addClass('link-visited');
					}
				}
				else {
					$link.addClass('link-broken');
				}

				$link.ariaClick({ one : true }, () => {
					if (typeof callback === 'function') {
						callback();
					}

					Engine.play(passage);
				});
			}

			if (text) {
				$link.append(document.createTextNode(text));
			}

			if (destination) {
				$link.appendTo(destination);
			}

			// For legacy-compatibility we must return the DOM node.
			return $link[0];
		}

		/*
			Create and return an external link.
		*/
		static createExternalLink(destination, url, text) {
			const $link = jQuery(document.createElement('a'))
				.attr('target', '_blank')
				.addClass('link-external')
				.text(text)
				.appendTo(destination);

			if (url != null) { // nullish test
				$link.attr({
					href     : url,
					tabindex : 0 // for accessibility
				});
			}

			// For legacy-compatibility we must return the DOM node.
			return $link[0];
		}
	}


	/*******************************************************************************
		Option Static Object.
	*******************************************************************************/

	Object.defineProperty(Wikifier, 'Option', {
		value : (() => {
			// Options array (stack).
			let _optionsStack = [];


			/*
				GlobalOption Functions.
			*/
			function length() {
				return _optionsStack.length;
			}

			function getter() {
				return Object.assign({}, ..._optionsStack);
			}

			function clear() {
				_optionsStack = [];
			}

			function get(index) {
				return _optionsStack[index];
			}

			function pop() {
				return _optionsStack.pop();
			}

			function push(options) {
				if (typeof options !== 'object' || options === null) {
					throw new TypeError(`Wikifier.Option.push options parameter must be an object (received: ${getTypeOf(options)})`);
				}

				return _optionsStack.push(options);
			}


			/*
				Exports.
			*/
			return Object.preventExtensions(Object.create(null, {
				length  : { get : length },
				options : { get : getter },
				clear   : { value : clear },
				get     : { value : get },
				pop     : { value : pop },
				push    : { value : push }
			}));
		})()
	});


	/*******************************************************************************
		Parser Static Object.
	*******************************************************************************/

	Object.defineProperty(Wikifier, 'Parser', {
		value : (() => {
			// Parser definition array.  Ordering matters, so this must be an ordered list.
			const _parsers = [];

			// Parser profiles object.
			let _profiles;


			/*
				Parser Functions.
			*/
			function getter() {
				return _parsers;
			}

			function add(parser) {
				// Parser object sanity checks.
				if (typeof parser !== 'object') {
					throw new Error('Wikifier.Parser.add parser parameter must be an object');
				}

				if (!Object.hasOwn(parser, 'name')) {
					throw new Error('parser object missing required "name" property');
				}
				else if (typeof parser.name !== 'string') {
					throw new Error('parser object "name" property must be a string');
				}

				if (!Object.hasOwn(parser, 'match')) {
					throw new Error('parser object missing required "match" property');
				}
				else if (typeof parser.match !== 'string') {
					throw new Error('parser object "match" property must be a string');
				}

				if (!Object.hasOwn(parser, 'handler')) {
					throw new Error('parser object missing required "handler" property');
				}
				else if (typeof parser.handler !== 'function') {
					throw new Error('parser object "handler" property must be a function');
				}

				if (Object.hasOwn(parser, 'profiles') && !(parser.profiles instanceof Array)) {
					throw new Error('parser object "profiles" property must be an array');
				}

				// Check for an existing parser with the same name.
				if (has(parser.name)) {
					throw new Error(`cannot clobber existing parser "${parser.name}"`);
				}

				// Add the parser to the end of the array.
				_parsers.push(parser);
			}

			function delete$(name) {
				const parser = _parsers.find(parser => parser.name === name);

				if (parser) {
					_parsers.delete(parser);
				}
			}

			function isEmpty() {
				return _parsers.length === 0;
			}

			function has(name) {
				return !!_parsers.find(parser => parser.name === name);
			}

			function get(name) {
				return _parsers.find(parser => parser.name === name) || null;
			}


			/*
				Parser Profile Functions.
			*/
			function profilesGetter() {
				return _profiles;
			}

			function profilesCompile() {
				if (BUILD_DEBUG) { console.log('[Wikifier.Parser/profilesCompile()]'); }

				const all  = _parsers;
				const core = all.filter(parser => !Array.isArray(parser.profiles) || parser.profiles.includes('core'));

				_profiles = Object.freeze({
					all : {
						parsers      : all,
						parserRegExp : new RegExp(all.map(parser => `(${parser.match})`).join('|'), 'gm')
					},
					core : {
						parsers      : core,
						parserRegExp : new RegExp(core.map(parser => `(${parser.match})`).join('|'), 'gm')
					}
				});

				return _profiles;
			}

			function profilesIsEmpty() {
				return typeof _profiles !== 'object' || Object.keys(_profiles).length === 0;
			}

			function profilesGet(profile) {
				if (typeof _profiles !== 'object' || !Object.hasOwn(_profiles, profile)) {
					throw new Error(`nonexistent parser profile "${profile}"`);
				}

				return _profiles[profile];
			}

			function profilesHas(profile) {
				return typeof _profiles === 'object' && Object.hasOwn(_profiles, profile);
			}


			/*
				Exports.
			*/
			return Object.preventExtensions(Object.create(null, {
				/*
					Parser Containers.
				*/
				parsers : { get : getter },

				/*
					Parser Functions.
				*/
				add     : { value : add },
				delete  : { value : delete$ },
				isEmpty : { value : isEmpty },
				has     : { value : has },
				get     : { value : get },

				/*
					Parser Profile.
				*/
				Profile : {
					value : Object.preventExtensions(Object.create(null, {
						/*
							Profiles Containers.
						*/
						profiles : { get : profilesGetter },

						/*
							Profiles Functions.
						*/
						compile : { value : profilesCompile },
						isEmpty : { value : profilesIsEmpty },
						has     : { value : profilesHas },
						get     : { value : profilesGet }
					}))
				}
			}));
		})()
	});


	/*******************************************************************************
		Additional Static Properties.
	*******************************************************************************/

	Object.defineProperties(Wikifier, {
		/*
			Legacy Aliases.
		*/
		helpers : {
			value : {
				createShadowSetterCallback : { value : WikifierUtil.shadowHandler },              // SEE: `markup/wikifier-util.js`
				evalPassageId              : { value : WikifierUtil.evalPassageName },            // SEE: `markup/wikifier-util.js`
				evalText                   : { value : WikifierUtil.evalText },                   // SEE: `markup/wikifier-util.js`
				hasBlockContext            : { value : hasBlockContext },                         // SEE: `util/hasblockcontext.js`
				inlineCss                  : { value : WikifierUtil.inlineCss },                  // SEE: `markup/wikifier-util.js`
				parseSquareBracketedMarkup : { value : WikifierUtil.parseSquareBracketedMarkup }, // SEE: `markup/wikifier-util.js`
				shadowHandler              : { value : WikifierUtil.shadowHandler }               // SEE: `markup/wikifier-util.js`
			}
		},

		isExternalLink : { value : isExternalLink },            // SEE: `util/isexternallink.js`
		getValue       : { value : State.getVar },              // SEE: `state.js`.
		setValue       : { value : State.setVar },              // SEE: `state.js`.
		parse          : { value : Scripting.desugar },         // SEE: `markup/scripting.js`.
		evalExpression : { value : Scripting.evalTwineScript }, // SEE: `markup/scripting.js`.
		evalStatements : { value : Scripting.evalTwineScript }, // SEE: `markup/scripting.js`.
		textPrimitives : { value : Patterns }                   // SEE: `lib/patterns.js`.
	});


	/*******************************************************************************
		Object Exports.
	*******************************************************************************/

	return Wikifier;
})();
/* eslint-enable max-len */
