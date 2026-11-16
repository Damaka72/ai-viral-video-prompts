# viral-home: build report

Preview path: `/viral-home/` (noindex, canonical points at the live page). The live `index.html` is untouched apart from the 100 to 50 fix. Regenerate any time with `python3 scrollcraft/builds/viral-home/build.py`.

## What was built
Gallery / catalogue. Object one (the Inuit clay film) is already in view with its exact prompt, and the prompt's words light up as you scroll (the signature move). Five more films and fourteen shelves (the free sample plus the 13 collections) walk past laterally. A tally counts to 46,714, the sum of the 13 labels, and the Mega Bundle closes the page as the last object. A film-strip index along the bottom edge jumps to any object. Fonts: Instrument Serif and Geist. No generated assets, no spend.

## Verified (headless Chrome, 1440px and 390px, plus reduced motion and no JavaScript)
- The build stops unless the 13 collection counts add up to the bundle's stated total; they sum to exactly 46,714.
- No console or page errors; no horizontal overflow; two font families.
- Both lateral rails have healthy overflow (1667px and 3323px at 1440 wide, so neither is a dead pinned screen).
- Index jumps land on the chosen object at five targets (a film, a collection, the free sample, the bundle, back to the hero). The strip names the current object.
- Prompt lighting runs word by word; with reduced motion or no JavaScript every word is fully lit and the rails become scroll regions or wrap.
- Prompt expand works. The film player is inserted only on click (youtube-nocookie).
- Popup: opens only when asked for, moves focus in and back, validates empty and malformed input, closes on Escape.
- Contrast: unlit prompt words raised to 50% opacity to clear 4.5:1; no other failures in the settled state.

## Not verified
- **The scrub.** No video files were supplied, so the hero is not a scrub yet and the page's peak is weaker than designed.
- **YouTube thumbnails and players** (my sandbox blocks them; the poster boxes showed as empty frames in my renders). Open the preview to confirm the thumbnails load.
- **A real phone**, other browsers, and the live Beehiiv signup (not submitted, to avoid creating a subscriber).
- **Contrast mid-reveal** and the dimmed words at every scroll position (only the settled state was graded).

## Findings in the live site (for the owner)
1. The **Beehiiv welcome email** that delivers the PDF may still say "100". It lives in Beehiiv, not this repo; please check it says 50.
2. The live meta description claims "Save 67% on the Ultimate Bundle". 13 collections at $1 is $13, so $9 is about a 31% saving. Remove or correct it before the live page is replaced.
3. The PDF's cover and headings show a blank box where an emoji was meant to appear (the font it was built with lacks the glyph). I did not change it.
4. The PDF's first-page bullets and the live page's "Mega Prompt Studio" naming were out of line with the 13 collection names; the closing list is now aligned, the first-page list describes the nine categories inside the PDF and is unchanged.
5. Everything under `scrollcraft/` and `viral-home/` is deployable static content, so planning files are reachable by URL once merged.
