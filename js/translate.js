"use strict";
/* exported populate_languages, ui_translate, get_text */

// translation a text
const translate_text = (dom, lang, text) => {
	let s = lang[text];
	if (s) {
		dom.html(s);
	}
};

// translation language
const translation = (lang) => {
	translate_text($("a#text_canvas"), lang, "canvas");
	translate_text($("a#text_setting"), lang, "setting");
	translate_text($("a#text_log"), lang, "log");
	translate_text($("h4#text_ui_language"), lang, "ui_language");
	translate_text($("h4#text_logs"), lang, "text_logs");
	translate_text($("h4#text_procedures"), lang, "text_procedures");
	translate_text($("a#text_help"), lang, "help");
	translate_text($("span#source_code"), lang, "source_code");
	translate_text($("a#report_bugs"), lang, "report_bugs");
	translate_text($("h4#supported_commands"), lang, "supported_commands");
	translate_text($("h4#examples"), lang, "examples");
	translate_text($("h4#global_vars"), lang, "global_vars");
	translate_text($("div#chess_board"), lang, "chess_board");
	translate_text($("div#frac_star"), lang, "frac_star");
	translate_text($("button#setting_save_btn"), lang, "save");
	translate_text($("span#proudly_brought_to_you_by"), lang, "proudly_brought_to_you_by");
};

// build the language <select> from the i18n registry
const populate_languages = () => {
	let sel = $("select#lang");
	if (!sel.length) {
		return;
	}
	let current = sel.val();
	sel.empty();
	let order =
		typeof LOGO_LANG_ORDER !== "undefined" && LOGO_LANG_ORDER.length ? LOGO_LANG_ORDER.slice() : [];
	// append any registered languages that are not explicitly ordered
	for (let code of Object.keys(LOGO_I18N)) {
		if (order.indexOf(code) === -1) {
			order.push(code);
		}
	}
	for (let code of order) {
		if (LOGO_I18N[code]) {
			sel.append($("<option></option>").attr("value", code).text(LOGO_I18N[code].name));
		}
	}
	if (current && LOGO_I18N[current]) {
		sel.val(current);
	}
};

// get ui lang data for the selected language (falls back to English)
const get_lang = () => {
	let code = $("select#lang").val();
	if (LOGO_I18N[code]) {
		return LOGO_I18N[code].dict;
	}
	return LOGO_I18N["en-us"] ? LOGO_I18N["en-us"].dict : {};
};

// ui translate
const ui_translate = () => {
	let data = get_lang();
	translation(data);
};

// translate
const get_text = (x, default_text = "") => {
	let lang = get_lang();
	if (lang && lang[x]) {
		return lang[x];
	}
	return default_text;
};
