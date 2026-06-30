"use strict";

const MAX_DEPTH = 1024;
const LOGO_ERR_STACK_OVERFLOW = "Stack Overflow";
const LOGO_ERR_MISSING_NUMBERS = "Missing Numbers";
const LOGO_ERR_UNKNOWN_COMMAND = "Unknown Command";
const LOGO_ERR_MISSING_PARAM = "Missing Parameter";
const LOGO_ERR_MISSING_LEFT = "Missing [";
const LOGO_ERR_MISSING_EXP = "Missing Expression";
const LOGO_ERR_MISSING_RIGHT = "Missing ]";
const LOGO_ERR_MISSING_END = "Missing End";
const LOGO_ERR_MISSING_QUOTE = 'Missing " After Make';
const LOGO_ERR_INVALID_VAR_NAME = "Invalid Variable Name";
const LOGO_ERR_MISSING_VAR_NAME = "Missing Variable Name";
const LOGO_ERR_INVALID_FUN_NAME = "Invalid Function Name";
const LOGO_ERR_INVALID_RGB = "RGB Syntax: [Red Green Blue]";
const LOGO_ERR_INVALID_FOR = "For Syntax: [VarName Start Stop Step]";
const LOGO_ERR_EVAL = "Expression Error";
const LOGO_ERR_INVALID_LABEL = "Invalid Label";

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	module.exports = {
		MAX_DEPTH,
		LOGO_ERR_STACK_OVERFLOW,
		LOGO_ERR_MISSING_NUMBERS,
		LOGO_ERR_UNKNOWN_COMMAND,
		LOGO_ERR_MISSING_PARAM,
		LOGO_ERR_MISSING_LEFT,
		LOGO_ERR_MISSING_EXP,
		LOGO_ERR_MISSING_RIGHT,
		LOGO_ERR_MISSING_END,
		LOGO_ERR_MISSING_QUOTE,
		LOGO_ERR_INVALID_VAR_NAME,
		LOGO_ERR_MISSING_VAR_NAME,
		LOGO_ERR_INVALID_FUN_NAME,
		LOGO_ERR_INVALID_RGB,
		LOGO_ERR_INVALID_FOR,
		LOGO_ERR_EVAL,
		LOGO_ERR_INVALID_LABEL,
	};
}
