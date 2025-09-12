// ---- geometry helpers for the SVG arcs ----
const cx = 100, cy = 100, r = 80;      // center & radius for the colored ring
const rTrack = 90;                      // thin grey background radius

function degToRad(d) { return (Math.PI / 180) * d; }
function polarToCartesian(cx, cy, r, angleDeg) {
  return {
    x: cx + r * Math.cos(degToRad(angleDeg)),
    y: cy + r * Math.sin(degToRad(angleDeg))
  };
}

/**
 * Build an SVG arc path from startAngle -> endAngle (in degrees).
 * Angles use SVG convention: 0° = right, 90° = down, 180° = left.
 */
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end   = polarToCartesian(cx, cy, r, startAngle);
  const delta = Math.abs(endAngle - startAngle);
  const largeArcFlag = delta > 180 ? "1" : "0";
  const sweepFlag = endAngle > startAngle ? "1" : "0";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
}

/** Map score (-100..100) to arc angle (180..0 along the top semicircle) */
function scoreToArcAngle(score) {
  const clamped = Math.max(-100, Math.min(100, Number(score) || 0));
  // -100 -> 180°, 0 -> 90°, 100 -> 0°
  return 180 * (100 - clamped) / 200;
}

/** Map score (-100..100) to needle CSS rotate (-90..+90 degrees) */
function scoreToNeedleRotate(score) {
  const clamped = Math.max(-100, Math.min(100, Number(score) || 0));
  return (clamped / 100) * 90; // deg
}

/** Update colored arc segments once at startup */
function drawSegments() {
  // We split the top semicircle into: Negative [-100,-10], Neutral [-10,10], Positive [10,100]
  const ANG_LEFT  = 180;                        // -100
  const ANG_NL    = scoreToArcAngle(-10);       // ≈ 99°
  const ANG_NR    = scoreToArcAngle(10);        // ≈ 81°
  const ANG_RIGHT = 0;                          // +100

  // Grey track (full semicircle)
  document.getElementById('track')
    .setAttribute('d', describeArc(cx, cy, rTrack, ANG_LEFT, ANG_RIGHT));

  // Colored segments
  document.getElementById('seg-neg')
    .setAttribute('d', describeArc(cx, cy, r, ANG_LEFT, ANG_NL));
  document.getElementById('seg-neu')
    .setAttribute('d', describeArc(cx, cy, r, ANG_NL, ANG_NR));
  document.getElementById('seg-pos')
    .setAttribute('d', describeArc(cx, cy, r, ANG_NR, ANG_RIGHT));
}

/** Animate the needle + update score label */
function renderScore(score) {
  const needle = document.getElementById('needle');
  const scoreEl = document.getElementById('scoreDisplay');

  // Normalize & label color
  const num = Math.max(-100, Math.min(100, Math.round(Number(score))));
  scoreEl.textContent = `Score: ${num}`;
  scoreEl.classList.remove('pos','neg','neu');
  if (num > 10) scoreEl.classList.add('pos');
  else if (num < -10) scoreEl.classList.add('neg');
  else scoreEl.classList.add('neu');

  // Animate needle by CSS transform (origin is set in CSS)
  const angle = scoreToNeedleRotate(num);
  needle.style.transform = `rotate(${angle}deg)`;
}

/** Handle form submit -> call Flask -> animate gauge */
document.addEventListener('DOMContentLoaded', () => {
  drawSegments();                       // prepare static arcs

  const form = document.getElementById('sentimentForm');
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const stockSymbol = document.getElementById('stockSymbol').value;


    try {
      const res = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ stock_symbol: stockSymbol })
      });

      const data = await res.json();

      // Be robust to both shapes: {sentiment: <number>} or {sentiment: {average_sentiment: <0..1>}}
      let score;
      if (typeof data.sentiment === 'number') {
        score = data.sentiment;
      } else if (data.sentiment && typeof data.sentiment.average_sentiment === 'number') {
        score = Math.round(data.sentiment.average_sentiment * 100);
      } else {
        throw new Error(data.error || 'Unexpected response from server');
      }

      renderScore(score);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });

  // Optional: set an initial neutral position
  renderScore(0);
});
