/**
 * Adjust confidence based on market vs sentiment alignment
 *
 * @param {number} confidence - original confidence (0..1)
 * @param {Object} data - dictionary of past values, e.g. {t1: 100, t2: 101}
 * @param {number} score - sentiment score (-100 .. 100)
 * @returns {number} - adjusted confidence (0..1)
 */
export function calculateConfidence(confidence, data, score) {
    const values = Object.values(data);

    if (!values || values.length < 2) return confidence;

    const last = values[values.length - 1];
    const prev = values[values.length - 2];

    const marketDelta = last - prev;

    let adjustment = 0;

    // normalize score magnitude 0..1
    const scoreMag = Math.abs(score) / 100;

    // ---- market moves against sentiment ----
    if ((marketDelta > 0 && score < 0) || (marketDelta < 0 && score > 0)) {
        // reduce confidence proportional to delta * normalized score
        const gap = Math.abs(marketDelta);
        adjustment = -gap * scoreMag;
    }
    // market moves with sentiment → no change

    let newConfidence = confidence + adjustment;

    // clamp to 0..1
    newConfidence = Math.max(0, Math.min(1, newConfidence));

    return Number(newConfidence.toFixed(3));
}
