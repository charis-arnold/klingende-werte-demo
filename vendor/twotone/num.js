/*
 * num – aus TwoTone (https://github.com/sonifydata/twotone, Commit 697cb4f),
 * Datei src/soundq/src/util/num.js.
 * Copyright (c) 2019 Datavized. MIT-Lizenz, siehe LICENSE in diesem Ordner.
 * Unverändert übernommen (wird von applyEnvelope.js gebraucht).
 */
export default function num(n, alt) {
	n = parseFloat(n);
	return isNaN(n) ? alt : n;
}
