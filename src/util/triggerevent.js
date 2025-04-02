/***********************************************************************************************************************

	util/triggerevent.js

	Copyright © 2022–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/

/*
	Triggers an event with the given name and options on the given element.

	NOTE: Intended to replace SugarCube's use of jQuery's event triggering methods
	as they treat synthetic events suboptimally when compared to standard events.

	Event options:
		// Whether the event bubbles (default: true).
		bubbles?: boolean
		// Whether the event is cancelable (default: true).
		cancelable?: boolean
		// Whether the event triggers listeners outside of a shadow root (default: false).
		composed?: boolean

	CustomEvent options:
		// Custom data sent with the event (default: none).
		detail?: any

	KeyboardEvent options:
		???

	MouseEvent options:
		???
*/
var triggerEvent = (() => { // eslint-disable-line no-unused-vars, no-var
	/*
		Return the correct event interface for the given event.
	*/
	function getEventInterface(name) {
		// SEE:
		//   * https://dom.spec.whatwg.org/#events
		//   * https://dom.spec.whatwg.org/#interface-customevent
		//   * https://w3c.github.io/uievents/
		switch (name.toLowerCase()) {
			case 'event':
				return Event;

			case 'keydown':
			case 'keyup':
				return KeyboardEvent;

			case 'auxclick':
			case 'click':
			case 'contextmenu':
			case 'dblclick':
			case 'mousedown':
			case 'mouseenter':
			case 'mouseleave':
			case 'mousemove':
			case 'mouseout':
			case 'mouseover':
			case 'mouseup':
				return MouseEvent;

			default:
				return CustomEvent;
		}
	}

	function triggerEvent(name, targets, options) {
		const optsWDefs = Object.assign({ bubbles : true, cancelable : true, composed : false }, options);
		const event     = new (getEventInterface(name))(name, optsWDefs); // eslint-disable-line new-cap
		const elements  = [];

		// No target was specified, default to `document`.
		if (!targets) {
			elements.push(document);
		}

		// An element collection of some kind.
		else if (
			targets instanceof jQuery
			|| targets instanceof NodeList
			|| targets instanceof Array
		) {
			for (let i = 0; i < targets.length; ++i) {
				elements.push(targets[i]);
			}
		}

		// Anything else.
		else {
			elements.push(targets);
		}

		// Dispatch the event to all of the targets, in order.
		for (let i = 0; i < elements.length; ++i) {
			elements[i].dispatchEvent(event);
		}
	}

	return triggerEvent;
})();
