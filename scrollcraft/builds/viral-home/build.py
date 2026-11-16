#!/usr/bin/env python3
"""Generate viral-home/index.html from source.html (a saved copy of the live page).

Everything the page states (collection names, prompt counts, prices, the six
example prompts) is read from source.html, then checked: the 13 collection
counts must add up to the bundle's stated total or the build stops.

Run from anywhere:  python3 scrollcraft/builds/viral-home/build.py [--apply-approved]
--apply-approved applies the punctuation changes in COPY-DIFF.md once the owner approves them.

Hero clip: if scrollcraft/builds/viral-home/assets/hero.mp4 (and hero-poster.webp) exist, the hero
becomes the page's one scrub. Until then it is a pinned act with the YouTube player.
"""
import re, sys, shutil, pathlib
from bs4 import BeautifulSoup

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[2]
OUT = ROOT / "viral-home"
ENGINE = ROOT / ".agents/skills/scroll-craft/engine"
APPLY = "--apply-approved" in sys.argv
S = BeautifulSoup((HERE / "source.html").read_text(encoding="utf-8"), "html.parser")

BUNDLE_URL = "https://aiviralvideoprompts.gumroad.com/l/hnjjmr"   # owner: bundle links go to Gumroad; stale _gl token stripped
COLLECTION_NAME = "AI Mega Video Prompts"                          # owner: one consistent collection name for the six examples
FREE_COUNT = 50                                                    # owner: the PDF is the truth (50)

APPROVED = []   # filled in once COPY-DIFF.md is approved: (current substring, replacement)

def norm(s): return re.sub(r"\s+", " ", s).strip()
def fix(t):
    if APPLY:
        for a, b in APPROVED: t = t.replace(a, b)
    return t
def esc(t): return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
def clean_link(u): return re.sub(r"\?_gl=.*$", "", u)

# ---------- examples (six films, each with its exact prompt) ----------
examples = []
for card in S.find_all(class_="video-card"):
    mid = re.search(r"openModal\('(modal\d+)'\)", card.get("onclick", "")).group(1)
    modal = S.find(id=mid)
    txt = norm(modal.get_text(" ", strip=True))
    m = re.search(r'Exact Prompt Used:\s*"(.*)"\s*Collection:\s*(.*?)\s*Category:\s*(.*?)\s*Type:\s*(.*?)\s*Get This', txt)
    assert m, mid
    title = norm(modal.find(["h2", "h3"]).get_text())
    examples.append(dict(id=mid, yt=card["data-video-id"], title=title, prompt=m.group(1),
                         category=m.group(3), type=m.group(4)))
assert len(examples) == 6
# owner: example 4's title did not match its prompt (an ad pitch in a co-working space); retitled to match
for e in examples:
    if e["title"] == "The Overnight Success Myth":
        e["title"] = "The Pitch: Our Ad Is Our Voice"

# ---------- collections ----------
pr = S.find(id="products")
collections = []
for card in pr.find_all(class_=re.compile("product-card")):
    h = card.find(["h3", "h2"])
    if not h: continue
    t = norm(card.get_text(" ", strip=True))
    n = re.search(r"([\d,]+) (?:professional |platform-optimized |film-quality )?prompts", t)
    topics = re.search(r"prompts\s*•\s*(.+?)\s*\$1", t)
    a = card.find("a", href=True)
    collections.append(dict(name=norm(h.get_text()), n=int(n.group(1).replace(",", "")),
                            topics=[x.strip() for x in topics.group(1).split("•")] if topics else [],
                            url=clean_link(a["href"])))
assert len(collections) == 13, len(collections)
TOTAL = sum(c["n"] for c in collections)
bundle_sec = next(h for h in S.body.find_all(["h2", "h3"]) if "Mega Video Prompts" in h.get_text()).find_parent("section")
stated = int(re.search(r"([\d,]+) professional prompts", norm(bundle_sec.get_text(" "))).group(1).replace(",", ""))
assert TOTAL == stated == 46714, (TOTAL, stated)   # the page only states numbers it can derive

# ---------- footer ----------
socials = []
for a in S.find("footer").find_all("a", href=True):
    if a["href"].startswith("http"):
        label = re.sub(r"^[^\w]+", "", norm(a.get_text()))
        socials.append((label, a["href"]))

has_clip = (HERE / "assets" / "hero.mp4").exists()
hero = examples[0]

def words(prompt):
    ws = prompt.split(" ")
    return "".join(f'<span class="w" style="--i:{i}">{esc(w)}</span> ' for i, w in enumerate(ws)).strip(), len(ws)

def film(e, cls=""):
    return (f'<div class="film {cls}" data-yt="{e["yt"]}">'
            f'<img class="film__poster" src="https://i.ytimg.com/vi/{e["yt"]}/maxresdefault.jpg" alt="" loading="lazy" decoding="async" '
            f'onerror="this.onerror=null;this.src=\'https://i.ytimg.com/vi/{e["yt"]}/hqdefault.jpg\'">'
            f'<button class="film__play" type="button" aria-label="Play the film: {esc(e["title"])}"><span aria-hidden="true"></span></button></div>')

def example_obj(i, e):
    return f'''
        <article class="obj obj--film" id="obj-film-{i}" data-name="{esc(e["title"])}" data-group="films">
          {film(e)}
          <div class="label">
            <h3>{esc(fix(e["title"]))}</h3>
            <p class="meta">{esc(e["category"])}. {esc(e["type"])}.</p>
            <p class="prompt" id="prompt-{i}">{esc(e["prompt"])}</p>
            <button class="more" type="button" aria-expanded="false" aria-controls="prompt-{i}">Read the whole prompt</button>
          </div>
        </article>'''

def free_obj():
    return f'''
        <article class="obj obj--shelf obj--free" id="obj-free" data-name="Free sample" data-group="collections">
          <div class="label">
            <h3>Free sample</h3>
            <p class="count">{FREE_COUNT}<span> prompts</span></p>
            <p class="meta">Nine categories. Delivered by email.</p>
            <p class="price">$0</p>
            <button class="act" type="button" data-open-popup>Send me the PDF</button>
          </div>
        </article>'''

def shelf_obj(i, c):
    return f'''
        <article class="obj obj--shelf" id="obj-col-{i}" data-name="{esc(c["name"])}" data-group="collections">
          <div class="label">
            <h3>{esc(c["name"])}</h3>
            <p class="count">{c["n"]:,}<span> prompts</span></p>
            <p class="meta">{esc(", ".join(c["topics"]))}.</p>
            <p class="price">$1</p>
            <a class="act" href="{c["url"]}">Get on Gumroad</a>
          </div>
        </article>'''

hero_words, nwords = words(hero["prompt"])
if has_clip:
    hero_media = ('<div class="film film--clip"><img class="sc-stage__poster" src="assets/hero-poster.webp" alt="">'
                  '<video data-sc-scrub data-sc-src="assets/hero.mp4" muted playsinline></video></div>')
    hero_act = 'data-sc-act="scrub" data-sc-span="3.0" data-sc-dwell="0.3"'
else:
    hero_media = film(hero, "film--hero")
    hero_act = 'data-sc-act="pin" data-sc-span="3.0"'

films_rail = "".join(example_obj(i, e) for i, e in enumerate(examples[1:], start=2))
shelf_rail = free_obj() + "".join(shelf_obj(i, c) for i, c in enumerate(collections, start=1))
tally_rows = "".join(f'<li><span>{esc(c["name"])}</span><span class="n">{c["n"]:,}</span></li>' for c in collections)

index_items = [("obj-film-1", hero["title"], "films")] + \
              [(f"obj-film-{i}", e["title"], "films") for i, e in enumerate(examples[1:], start=2)] + \
              [("obj-free", "Free sample", "collections")] + \
              [(f"obj-col-{i}", c["name"], "collections") for i, c in enumerate(collections, start=1)] + \
              [("obj-bundle", COLLECTION_NAME + ": the bundle", "bundle")]
strip_html = "".join(f'<a class="tick" href="#{i}" data-target="{i}" data-group="{g}" aria-label="{esc(n)}"><i></i></a>' for i, n, g in index_items)
social_html = " ".join(f'<a href="{h}" rel="noopener">{esc(l)}</a>' for l, h in socials)

css = (HERE / "style.css").read_text(encoding="utf-8")
js = (HERE / "app.js").read_text(encoding="utf-8")
meta_desc = f"{TOTAL:,} AI video prompts in 13 collections: $1 each, or $9 for all of them. See six films and the exact prompts that made them."

page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>AI Viral Video Prompts (preview)</title>
<meta name="description" content="{meta_desc}">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="https://aiviralvideoprompts.com/">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%2307090F'/><path d='M12 9l12 7-12 7z' fill='%23FF2D5F'/></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="scrollcraft.css">
<style>
{css}
</style>
<script>document.documentElement.classList.add('js');</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="mast"><h1>AI Viral Video Prompts</h1></header>

<main id="main">

  <!-- OBJECT ONE: the film and the words that made it. Already in view, already labelled. -->
  <section id="obj-film-1" class="hero" {hero_act} data-name="{esc(hero["title"])}" data-group="films">
    <div data-sc-stage class="hero__stage">
      <div class="hero__grid">
        {hero_media}
        <div class="label label--hero">
          <p class="meta">{esc(hero["category"])}. {esc(hero["type"])}.</p>
          <h2>{esc(hero["title"])}</h2>
          <p class="field">Exact prompt</p>
          <p class="prompt prompt--hero" id="hero-prompt" data-n="{nwords}">{hero_words}</p>
          <p class="meta meta--end">Collection: {COLLECTION_NAME}. <a class="act" href="{BUNDLE_URL}">Get the bundle, $9</a></p>
        </div>
      </div>
    </div>
  </section>

  <!-- THE OTHER FIVE FILMS: a lateral walk -->
  <section class="walk" id="films" data-sc-act="pan" data-sc-span="3.4">
    <div data-sc-stage>
      <div class="rail" data-sc-pan="0.06">
        <div class="rail__head"><h2>Films</h2><p class="meta">Five more, each with its exact prompt.</p></div>{films_rail}
        <div class="rail__end"><p class="meta">Collection for all six films: {COLLECTION_NAME}.</p></div>
      </div>
    </div>
  </section>

  <!-- THE COLLECTIONS: the free sample, then thirteen shelves -->
  <section class="walk" id="collections" data-sc-act="pan" data-sc-span="4.2">
    <div data-sc-stage>
      <div class="rail rail--shelf" data-sc-pan="0.06">
        <div class="rail__head"><h2>Collections</h2><p class="meta">One free sample, then thirteen shelves at $1 each.</p></div>{shelf_rail}
        <div class="rail__end"><p class="meta">Thirteen collections. Counted next.</p></div>
      </div>
    </div>
  </section>

  <!-- THE TALLY: the total is the sum of the thirteen labels just passed -->
  <section class="tally sc-section" id="tally">
    <div class="wrap tally__in" data-sc-in data-sc-stagger="80">
      <p class="tally__total"><span data-sc-count="0 {TOTAL:,}">{TOTAL:,}</span> <span class="unit">prompts</span></p>
      <p class="meta">The sum of the thirteen collections.</p>
      <ul class="tally__list">{tally_rows}</ul>
    </div>
  </section>

  <!-- THE LAST OBJECT: the bundle, labelled like the rest -->
  <section class="close sc-section" id="obj-bundle" data-name="{COLLECTION_NAME}: the bundle" data-group="bundle">
    <div class="wrap">
      <article class="obj obj--bundle" data-sc-in data-sc-stagger="80">
        <div class="label">
          <h3>{COLLECTION_NAME}</h3>
          <p class="meta">All 13 collections.</p>
          <p class="count">{TOTAL:,}<span> prompts</span></p>
          <p class="price">$9</p>
          <a class="act act--big" href="{BUNDLE_URL}">Get the bundle on Gumroad</a>
        </div>
      </article>
      <footer class="foot">
        <p class="socials">{social_html}</p>
        <p class="legal"><a href="terms_of_service.html">Terms of Service</a> <a href="privacy_policy.html">Privacy Policy</a></p>
        <p class="small">AI Viral Video Prompts. Professional AI Video Creation Made Simple.</p>
      </footer>
    </div>
  </section>

</main>

<nav class="strip" aria-label="Index of objects">
  <span class="strip__now" id="strip-now" aria-live="off">{esc(hero["title"])}</span>
  <span class="strip__ticks">{strip_html}</span>
  <span class="strip__tabs"><a href="#obj-film-1">Films</a><a href="#obj-free">Collections</a><a href="#obj-bundle">Bundle</a></span>
</nav>

<div id="leadMagnetPopup" class="lead" role="dialog" aria-modal="true" aria-labelledby="popup-title" aria-hidden="true" hidden>
  <div class="lead__overlay" data-close-popup></div>
  <div class="lead__box" id="lead-box">
    <button class="lead__close" type="button" data-close-popup aria-label="Close">&times;</button>
    <h2 id="popup-title">Get {FREE_COUNT} FREE AI Video Prompts</h2>
    <p>Start creating videos today with {FREE_COUNT} hand-picked prompts.</p>
    <ul class="lead__list">
      <li>{FREE_COUNT} Professional Video Prompts</li>
      <li>Works With Any AI Video Tool</li>
      <li>Multiple Content Categories</li>
      <li>Instant Digital Download</li>
    </ul>
    <form id="leadMagnetForm" novalidate>
      <label for="leadFirstName">First name</label><input id="leadFirstName" name="first_name" type="text" autocomplete="given-name" required>
      <label for="leadLastName">Last name</label><input id="leadLastName" name="last_name" type="text" autocomplete="family-name" required>
      <label for="leadEmail">Email</label><input id="leadEmail" name="email" type="email" autocomplete="email" required>
      <button class="act act--big lead__go" type="submit">Get my free prompts now</button>
      <p class="lead__err" id="lead-err" role="alert" hidden></p>
    </form>
    <p class="small">We respect your privacy. Unsubscribe anytime.</p>
  </div>
</div>

<script src="scrollcraft.js"></script>
<script>try{{ScrollCraft.mount(document.body);}}catch(e){{document.documentElement.classList.add('sc-failed');console.warn('scrollcraft',e);}}</script>
<script>
{js}
</script>
</body>
</html>
'''
page = fix(page)
OUT.mkdir(exist_ok=True)
(OUT / "index.html").write_text(page, encoding="utf-8")
shutil.copy(ENGINE / "scrollcraft.css", OUT / "scrollcraft.css")
shutil.copy(ENGINE / "scrollcraft.js", OUT / "scrollcraft.js")
if has_clip:
    (OUT / "assets").mkdir(exist_ok=True)
    for f in (HERE / "assets").iterdir(): shutil.copy(f, OUT / "assets" / f.name)
print("wrote", OUT / "index.html", f"({len(page)//1024} KB)", "| hero:", "SCRUB clip" if has_clip else "pinned (no clip yet)",
      "| copy:", "approved changes applied" if APPLY else "as live", f"| total {TOTAL:,}")
