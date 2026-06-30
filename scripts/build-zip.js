"use strict";

/**
 * build-zip.js — package the extension into a Chrome Web Store ready ZIP.
 *
 * Reads the version from manifest.json and writes
 * dist/logoturtle-v<version>.zip containing only the files the extension needs
 * at runtime (no node_modules, tests, tooling or source-control metadata).
 *
 * Usage: node scripts/build-zip.js  (or: npm run build)
 */

const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const version = manifest.version;

const outDir = path.join(root, "dist");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `logoturtle-v${version}.zip`);

// Files and folders that make up the shippable extension.
const TOP_LEVEL_FILES = ["manifest.json", "main.html", "LICENSE"];
const FOLDERS = ["js", "lang", "bs", "css", "images", "_locales"];

const output = fs.createWriteStream(outFile);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
	const kb = (archive.pointer() / 1024).toFixed(1);
	console.log(`Created ${path.relative(root, outFile)} (${kb} KB)`);
});

archive.on("warning", (err) => {
	if (err.code === "ENOENT") {
		console.warn("archiver warning:", err.message);
	} else {
		throw err;
	}
});
archive.on("error", (err) => {
	throw err;
});

archive.pipe(output);

for (const file of TOP_LEVEL_FILES) {
	const full = path.join(root, file);
	if (fs.existsSync(full)) {
		archive.file(full, { name: file });
	} else {
		console.warn(`skipping missing file: ${file}`);
	}
}

for (const folder of FOLDERS) {
	const full = path.join(root, folder);
	if (fs.existsSync(full)) {
		archive.directory(full, folder);
	} else {
		console.warn(`skipping missing folder: ${folder}`);
	}
}

archive.finalize();
