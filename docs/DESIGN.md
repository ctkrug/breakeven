# Design — Breakeven

## 1. Aesthetic direction

**Breakeven is a neo-brutalist wall poster.** Thick black rules on a warm cream ground, oversized
numerals, and two loud accent colors — a hot vermillion for the API cost line and a deep electric
teal for the self-host line — that collide at the crossover like a headline being stamped onto
the page. The tone is declarative and a little cocky: it's turning a Twitter argument into a
poster with a number on it. No soft gradients, no blur, no rounded dark cards — flat color,
hard edges, hard shadows.

This direction (and palette family) is new to the portfolio: recent ships have leaned heavily on
blueprint/technical drafting-table looks (Runlocal, Bankroll, Cronlet, Phantom Read, Skillcheck)
and dark forensic/microscope tables (Unmask, Mitosis Lab, Metawipe). Breakeven is bright,
warm-papered, and poster-loud instead — no ink-blue grid, no near-black surface.

## 2. Tokens

| Token              | Value     | Use                                            |
| ------------------ | --------- | ---------------------------------------------- |
| `--bg`             | `#F5EFE3` | page background — warm cream paper             |
| `--surface-1`      | `#FFFFFF` | cards, panels                                  |
| `--surface-2`      | `#E8E1D2` | secondary panels, input tracks, table stripes  |
| `--text`           | `#14120F` | primary ink                                    |
| `--text-muted`     | `#5C564C` | secondary labels, captions                     |
| `--accent`         | `#E8451A` | API cost line, primary CTA, "rent" side        |
| `--accent-support` | `#0E7C7B` | self-host cost line, "own" side                |
| `--success`        | `#1F9D55` | positive/confirmation states                   |
| `--danger`         | `#D6293E` | error/invalid input states                     |
| `--line`           | `#14120F` | rules, borders — always solid, never soft gray |

**Type pairing:** Display — **Archivo Black** (900, headline numerals, the breakeven callout,
the wordmark). UI — **Space Grotesk** (400/500/700, labels, inputs, body copy, table data).
Both load from Google Fonts with `system-ui, sans-serif` fallback.

**Spacing unit:** 8px scale (8/16/24/32/48/64).

**Corner radius:** sharp — 0–4px only. Brutalist, not soft.

**Shadow style:** hard offset shadow, no blur: `4px 4px 0 var(--line)` on cards and buttons;
`2px 2px 0` on smaller controls. Pressing a button drops the offset to `1px 1px 0` and nudges
the element down-right 2px, so it visibly "presses into" the page.

**Motion:** UI transitions 150ms ease-out. The crossover callout "stamps" onto the chart with a
120ms scale-and-settle (1.15 → 1.0) plus a 2° rotation snap to 0°, echoing a rubber ink stamp.
Slider drag updates the chart with no debounce — the crossover point tracks the pointer live.

## 3. Layout intent

**Hero:** the crossover chart itself — API cost line vs. self-host cost line over a token-volume
x-axis, with the breakeven point annotated directly on the chart in the display font. On desktop
(1440×900) the chart + token-volume slider occupy the left ~65% of the viewport; a right rail
(~35%) holds the GPU picker, cost assumptions (electricity price, utilization, hardware
lifetime), and the API price reference — all in poster-style bordered panels with hard shadows.
On phone (390×844) the layout stacks: chart + slider first (full width, ~55vh), then the GPU
picker and assumptions panels below as full-width cards, each still hard-bordered.

The breakeven number itself (e.g. "42M tokens/mo") is never buried in a table — it's set in
Archivo Black at a size that reads from across a room, directly above or beside the chart.

## 4. Signature detail

Small **registration-mark crosshairs** (⌖-style print-production marks, drawn in the accent
colors) sit in the corners of the main chart panel and the header — a recurring nod to the
"printed poster" conceit. The wordmark "BREAKEVEN" is set in Archivo Black with the "EVEN" half
colored in `--accent-support` and "BREAK" in `--accent`, so the wordmark itself previews the
two-line collision the whole app is about.

## 5. Interaction plan (non-game, but still needs to feel alive)

- **Slider drag:** thumb is a custom hard-edged square with a hard shadow; dragging it updates
  the chart and the breakeven callout in real time, no lag.
- **Crossover stamp:** whenever the computed breakeven volume changes, the callout re-stamps
  (120ms scale + rotation settle described above) so the update is felt, not just redrawn.
- **GPU picker:** custom-styled select (never a naked native dropdown) with hover/focus/active
  states matching the button treatment (hard shadow that compresses on press).
  All inputs get a visible `--accent` focus ring (3px, offset 2px) for keyboard users.
- **Invalid input** (e.g. negative token volume): the field border and label flip to `--danger`
  with a short shake (respecting `prefers-reduced-motion`), not a silent clamp.
- **Reduced motion:** stamp/shake animations are dropped in favor of an instant state change
  when `prefers-reduced-motion: reduce` is set; the chart still updates.
