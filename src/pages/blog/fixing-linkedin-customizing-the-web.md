---
layout: ../../layouts/PostLayout.astro
title:
  "Personal Software Is Getting Cheaper to Build, So I Killed My LinkedIn Feed"
date: "August 9, 2026"
toc: true
intro:
  "<p>Everyone has a website they wish they could change. Some features are
  exactly what you want. Others are sharp edges you merely tolerate. The reality
  is that rarely do these perfectly align between people.</p>"
description:
  "A Chrome extension to hide the LinkedIn feed, the surprising ease of building
  it, and what World of Warcraft's WeakAuras ecosystem suggests about the future
  of personal software."
---

## The Good, the Bad, and the LinkedIn Feed

LinkedIn is polarizing. Many people ask "why even bother?" I do get genuine
value from it: job search tooling that works for me, and an easy way to stay in
touch with former coworkers. But I have never enjoyed the feed, never engaged
with it, and have quietly tolerated it for years. There are entire communities
dedicated to making fun of just how unhinged it can be (see:
[r/LinkedInLunatics](https://www.reddit.com/r/LinkedInLunatics/)), and I do not,
will not, and never will interact with it.

That tolerance ended yesterday when LinkedIn led with this:

![LinkedIn feed suggested post, containing an AI comic of a recruiter splooging with the phrasing 'came across your profile'](/assets/images/linkedin.png)

In the past, I've shrugged off the crypto scams, sigma-grindset posts, and
whatever else has been thrown at me. But for whatever reason, a post of
someone's AI-generated comic of a recruiter splooging was the straw that broke
this camel's back.

I knew a Chrome extension could hide the feed. I'd just never built one. The
upfront cost of learning the manifest format, content script lifecycle, and
extension APIs had always felt like more friction than the annoyance was worth.
This time, the distance between "I wish this site worked differently" and "now
it does" was about two prompts.

## linkedin-feed-blocker

The result is intentionally unambitious. It hides LinkedIn's main feed and
blocks the API requests that load feed content. Jobs, profiles, search,
messaging, and notifications are untouched.

**GitHub:**
[andrewpollack/linkedin-feed-blocker](https://github.com/andrewpollack/linkedin-feed-blocker)

![LinkedIn homepage with the main feed removed. The profile sidebar and news sidebar remain, but the center column is empty](/assets/images/after.png)

## It's Not Just About LinkedIn

I also posted the extension to
[Hacker News](https://news.ycombinator.com/item?id=49223475). One comment in
particular stuck with me, from user
[wxw](https://news.ycombinator.com/user?id=wxw):

> The web, at least on the interface side, is really easy to customize these
> days. Agents are pretty good at spinning out Chrome extensions. e.g. you can
> easily reduce the intensity of feed-based UI by removing thumbnails,
> grayscaling, etc.

The extension itself isn't particularly impressive. What feels different is how
easy it was to build something I'd never touched before to fix something I'd
spent years tolerating.

User-controlled web customization isn't new. Greasemonkey dates to 2004, and
tools like Tampermonkey, Stylus, and uBlock Origin have given technical users
various ways to reshape websites ever since.

What changed is the authorship cost for bespoke modifications. Previously,
building a browser extension meant learning the manifest format, content script
lifecycle, permissions model, and enough about the target site's DOM to write
selectors that held up before solving the actual problem you came to solve. For
a personal annoyance, that overhead usually wasn't worth it.

When making the change becomes cheap enough, tolerating the default is no longer
the only reasonable option. Instead of accepting every product decision made for
us, more of us can build a thin personal layer on top:

- Want YouTube without Shorts? **Block them**.
- Want every infinite-scrolling site to have a "next page" button instead?
  **Build it**.
- Want the LinkedIn feed to stop feeding you AI splooge comments? **Remove it**.

For a long time, websites have gotten increasingly sophisticated at changing
their interfaces to influence what users do. The authorship cost is now low
enough that users can start changing them back.

## World of Warcraft and WeakAuras

For a final example, I want to talk about a dear hobby of mine:
[World of Warcraft](https://worldofwarcraft.blizzard.com/en-us/).

For those unfamiliar with the specifics of WoW, the game has a massive ecosystem
of community-created addons. These are Lua scripts that execute as part of the
game itself and can make substantial changes to how information is presented to
the player.

Below are several players' views of the same game. The underlying world is
identical; what's personal is the layer through which each player sees it.

<!-- prettier-ignore -->
<div class="wow-slideshow">
  <input type="radio" name="wow-slide" id="ws0" checked>
  <input type="radio" name="wow-slide" id="ws1">
  <input type="radio" name="wow-slide" id="ws2">
  <input type="radio" name="wow-slide" id="ws3">
  <input type="radio" name="wow-slide" id="ws4">
  <input type="radio" name="wow-slide" id="ws5">
  <div class="wow-slides">
    <div class="wow-slide-item"><img src="/assets/images/wow-ui-0.png" alt="World of Warcraft UI customized with community addons" /><label for="ws5" class="wow-prev" aria-label="Previous slide"></label><label for="ws1" class="wow-next" aria-label="Next slide"></label></div>
    <div class="wow-slide-item"><img src="/assets/images/wow-ui-1.png" alt="World of Warcraft UI customized with community addons" /><label for="ws0" class="wow-prev" aria-label="Previous slide"></label><label for="ws2" class="wow-next" aria-label="Next slide"></label></div>
    <div class="wow-slide-item"><img src="/assets/images/wow-ui-2.png" alt="World of Warcraft UI showing a custom addon layout" /><label for="ws1" class="wow-prev" aria-label="Previous slide"></label><label for="ws3" class="wow-next" aria-label="Next slide"></label></div>
    <div class="wow-slide-item"><img src="/assets/images/wow-ui-3.png" alt="World of Warcraft UI with modified interface elements" /><label for="ws2" class="wow-prev" aria-label="Previous slide"></label><label for="ws4" class="wow-next" aria-label="Next slide"></label></div>
    <div class="wow-slide-item"><img src="/assets/images/wow-ui-4.png" alt="World of Warcraft UI with complex addon configuration" /><label for="ws3" class="wow-prev" aria-label="Previous slide"></label><label for="ws5" class="wow-next" aria-label="Next slide"></label></div>
    <div class="wow-slide-item"><img src="/assets/images/wow-ui-5.png" alt="World of Warcraft UI with community addon customization" /><label for="ws4" class="wow-prev" aria-label="Previous slide"></label><label for="ws0" class="wow-next" aria-label="Next slide"></label></div>
  </div>
  <div class="wow-dots">
    <label for="ws0"></label>
    <label for="ws1"></label>
    <label for="ws2"></label>
    <label for="ws3"></label>
    <label for="ws4"></label>
    <label for="ws5"></label>
  </div>
</div>

Historically, though, creating an addon required at least some knowledge of Lua,
WoW's APIs, and the addon ecosystem. You could customize the game, but there was
still a meaningful barrier to entry.

[WeakAuras](https://www.curseforge.com/wow/addons/weakauras-2) changed the
picture, not by eliminating that complexity, but by absorbing it into a better
layer.

> WeakAuras is a powerful and flexible framework that allows the display of
> highly customizable graphics on World of Warcraft's user interface to indicate
> buffs, debuffs, and other relevant information.

![The WeakAuras new aura dialog showing template options including Simple, Group, Dynamic Group, Button, and Progress Bar](/assets/images/weakauras.png)

What WeakAuras provided was more than an easier scripting surface. It was a
stable abstraction layer with a visual editor, a portable serialization format
for sharing configurations, and a distribution ecosystem through
[Wago.io](https://wago.io/) where players could publish and discover
modifications. Someone solved a problem once, packaged it, and thousands of
other players could install or fork it, all without touching the underlying
addon APIs.

Using WeakAuras became second nature. You saw something you wanted to change,
and you just changed it. Far less expertise was required than working directly
with the addon API.

Some people took this customization in wonderfully ridiculous directions, like
using GIFs to turn WoW into a [first-person mode](https://imgur.com/etACF8F).
Others built sophisticated interfaces tailored to a particular class, boss
encounter, or play style.

<!-- prettier-ignore -->
<video muted loop playsinline controls aria-label="World of Warcraft gameplay using WeakAuras and custom UI elements to mimic a first-person shooter"><source src="/assets/images/fps.mp4" type="video/mp4"></video>

Like many others, I used WeakAuras to filter the enormous amount of information
WoW throws at you down to the handful of things that actually matter. For
example, I used [PedroLust](https://wago.io/Pq8Xhp2_9) to track whether
Bloodlust is active. No need to accept Blizzard's default.

WeakAuras didn't eliminate the need for someone to understand WoW's addon API,
but it created a stable enough abstraction layer that most people never had to.
That's the part worth paying attention to: not just cheaper creation, but a
portable format, a sharing ecosystem on Wago, and reusable work that compounds
over time. This entire exercise made me wonder what a similar layer for the web
would look like. I don't think the equivalent for the web would look exactly
like WeakAuras, but I suspect there's a better model for personal software that
rhymes with it.

## Optimism for a Layer of Your Own

Both approaches ultimately depend on the platform underneath them. WoW
explicitly exposes APIs for addons; browser extensions modify a DOM that a site
can restructure without notice. When Blizzard restricted the
[combat information available to addons](https://www.wowhead.com/news/combat-addons-disabled-in-end-game-content-in-midnight-378679)
in their latest expansion, the WeakAuras team announced they didn't plan to
[release a version for Midnight](https://us.forums.blizzard.com/en/wow/t/weak-auras-announces-end-of-services-for-midnight/2177028)
because too much of the framework's core functionality was no longer possible.

The platform controls the floor you build on.

That said, as the cost of building small pieces of software falls, some degree
of brittleness becomes acceptable. A fix that costs one prompt to rebuild when
it breaks is still worth having. And the ability to quickly fix the thing you
don't like on your own is genuinely available to more people now.

The interesting outcome isn't that everyone starts writing browser extensions.
It's that the set of people for whom "just build something small for yourself"
is cost-effective has grown considerably.

Platforms have to optimize for the median user. That's a tradeoff, not a bug.
But as personal software gets cheaper to build, more of us can simply change the
parts that don't work for us:

- Reshaping interfaces around how we actually want to interact with them
- Removing dark patterns like infinite scrolling
- Fixing the tiny annoyances that would never justify a feature request

For now, I'm happy that my extension means I don't have to see splooge on the
job-search website.
