"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputFile = path.join(root, "badges", "javascript.json");
const checkOnly = process.argv.includes("--check");

const LANGUAGE_BY_EXTENSION = new Map([
	[".css", "CSS"],
	[".html", "HTML"],
	[".js", "JavaScript"],
]);

const IGNORE_DIRS = new Set([
	".git",
	".github",
	".nyc_output",
	"bs",
	"coverage",
	"dist",
	"node_modules",
]);
const IGNORE_FILES = new Set(["js/jquery-3.3.1.min.js", "js/jquery-ui.js", "css/jquery-ui.css"]);

function normalizePath(filePath) {
	return filePath.split(path.sep).join("/");
}

function collectLanguageBytes(dir, totals) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		const relativePath = normalizePath(path.relative(root, fullPath));

		if (entry.isDirectory()) {
			if (!IGNORE_DIRS.has(entry.name)) {
				collectLanguageBytes(fullPath, totals);
			}
			continue;
		}

		if (!entry.isFile() || IGNORE_FILES.has(relativePath)) {
			continue;
		}

		const language = LANGUAGE_BY_EXTENSION.get(path.extname(entry.name));
		if (!language) {
			continue;
		}

		const size = fs.statSync(fullPath).size;
		totals.set(language, (totals.get(language) || 0) + size);
	}
}

function createBadge() {
	const totals = new Map();
	collectLanguageBytes(root, totals);
	const totalBytes = Array.from(totals.values()).reduce((sum, size) => sum + size, 0);
	const javascriptBytes = totals.get("JavaScript") || 0;
	const percentage = totalBytes === 0 ? 0 : (javascriptBytes / totalBytes) * 100;

	return {
		schemaVersion: 1,
		label: "JavaScript",
		message: `${percentage.toFixed(1)}%`,
		color: "f1e05a",
	};
}

const badge = `${JSON.stringify(createBadge(), null, 2)}\n`;

if (checkOnly) {
	const current = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, "utf8") : "";
	if (current !== badge) {
		console.error("badges/javascript.json is stale. Run npm run badges.");
		process.exit(1);
	}
	console.log("badges/javascript.json is up to date.");
} else {
	fs.mkdirSync(path.dirname(outputFile), { recursive: true });
	fs.writeFileSync(outputFile, badge);
	console.log(`Updated ${path.relative(root, outputFile)}.`);
}
