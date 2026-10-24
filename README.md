# Dino Day (Dinopäev)

A gentle 3D browser game for ages 4-6, built with three.js + Vite. Same idea as
[Princess Day](https://github.com/bokunobaka/princess-day), but in a world of dinosaurs. No reading needed:
quests are shown as pictures, friends speak their lines, and nothing can be lost or failed.

    npm install
    npm run dev       # open the printed URL (also reachable from a tablet on the same Wi-Fi)
    npm run build     # production build in dist/ (relative paths, host it from any folder)

**Play it:** https://bokunobaka.github.io/dino-day/ (published by GitHub Pages; every push to `main`
rebuilds and redeploys it via `.github/workflows/pages.yml`, about a minute).

Everything is drawn in code (no model or image downloads), so it loads instantly.
Progress (finished days, colours and hats, eggs, pet, sound setting) is kept in localStorage.

## How to move

Two ways, and they work together (change it in the parent corner: *Both / Tap / Joystick*):

- **Tap** the ground to walk there, or tap a thing to walk to it and use it.
- **Hold and drag** anywhere to get a floating joystick: drag *up* to walk away from the camera, *down* to come back,
  left and right to turn. The further you drag, the faster you go. Let go to stop.

## Language

Estonian by default. Add `?lang=en` for English (the choice is remembered; `?lang=et` switches back).
All words live in `src/i18n.js` as `[estonian, english]` pairs. Spoken lines use a device voice for the language, and if the
device has none (many have no Estonian voice) the game shows the subtitle only.

## Voice (recorded Estonian) — not recorded yet

The game already looks for recorded clips in `public/voice/et/` (found by a hash of the exact line text), falls back to
a device voice and finally to the subtitle alone. To add the Estonian voice later:

    node tools/voice-lines.mjs > lines.json      # every spoken line with its id (226 lines)
    # generate each line as <id>.wav with a voice, put them in one folder, then:
    node tools/wav-to-mp3.mjs <folder-with-wavs>  # writes public/voice/et/*.mp3 + manifest.json

Editing a line in `src/i18n.js` means re-recording that line.

## The sixteen days

| Day | Place | What happens |
| --- | --- | --- |
| 1 Egg Day | fern meadow | find 3 lost eggs, take them to Mama Bronto's nest, tap them so they hatch |
| 2 Wake-up Day | home cave | pick a colour and hat at the puddle, wake 3 sleepy friends, parade into the sunshine |
| 3 Stew Day | stone kitchen | find a fern, a berry and a mushroom, stir the pot, cook it on the fire, fill 6 bowls |
| 4 Picnic Day | meadow | invite 3 friends, seat them on the blanket, serve each the food they like |
| 5 Volcano Party | night under the volcano | light 3 torches, invite 4 friends, stomp the glowing footprints, the volcano erupts fireworks |
| 6 Fossil Day | badlands dig site | dig up 3 bones, brush them clean, put the skeleton together |
| 7 Birthday | party clearing | gather balloons, find presents, light the candles, sing happy birthday to Bronto |
| 8 Jungle Run | thick jungle | find 3 amber stones, roll the boulder gate away, run to the sunny nest; friendly raptors only want hugs |
| 9 Snow Day | snowy valley | roll up a snow dino, dress it, give presents to the shivering friends |
| 10 Waterhole Day | the waterhole | find floaty toys, jump in (friends too), serve everyone a drink |
| 11 Sea Floor | prehistoric sea | open clams for pearls, befriend 3 sea reptiles, open the treasure chest |
| 12 Nursery Day | the nursery farm | pick leaves, feed the hungry long-neck, lead 3 babies to their pen |
| 13 Band Day | open-air stage | find 3 instruments, stomp the glowing drums, play on stage |
| 14 Circus Day | the dino circus | gather balls, walk the log over the lava stream, send Trixie through the fiery hoop |
| 15 Camping Day | campsite at dusk | find firewood, light the campfire, toast marshmallows for friends |
| 16 Ice Day | frozen lake | glide on slippery ice, gather snowflakes, spin on the star, skate with friends |

Days unlock in order; finished days can be replayed from the title screen or the signpost in the valley.

## Beyond the days

- **Dino Valley** is home: a pet cave, three egg nests (lay an egg, keep it warm, and after a few days of play it
  hatches into a baby dino), a photo spot (photos are kept in the fossil book), the colour-and-hat puddle,
  the fossil book, the day signpost, a pterodactyl perch and a stomp pad.
- **Mini-games** from the valley: a pterodactyl flight over the land (steer by dragging or tapping) and a footprint-memory
  stomp party.
- **A baby dino pet** (picked and named on first play) follows along and cheers when quests are done.
- **Rewards:** each finished day (and mini-game) unlocks a body colour or a hat. 14 colours, 12 hats.
- **Parent corner:** hold the gear button for about a second: language, volume, movement style (tap / joystick / both),
  back to the valley or title, start over.
- **Offline:** the built game installs on a tablet ("Add to Home Screen") and then works without Wi-Fi (service worker
  generated at build time).

Dev shortcuts: `?day=3` starts a day directly (`101` pterodactyl flight, `102` stomp party), `?unlock` unlocks all days,
`?area=jungle` previews a place. `/gallery.html` (dev server only) shows every dinosaur and hat.

## Code map

- `src/game.js` core: input (tap + joystick), camera, areas, quest progress, followers, wardrobe
- `src/dinos.js` the procedural dinosaurs: 13 species, one shared animator, the player with colours and hats
- `src/days/` one file per day (steps + behaviour); add a day by adding a file and listing it in `index.js`
- `src/areas/` the places: meadow, valley, cave, kitchen, volcano, dig site, jungle, sea floor...
- `src/scenery.js` plants, rocks, eggs, nests, food, instruments... and `bake()` which merges static scenery into a few draw calls
- `src/ui.js` HUD, title, wardrobe, tray; `src/audio.js` synthesized sounds, dino calls and music (no audio files)

## Credits

Everything (dinosaurs, scenery, sounds) is made in code; there are no third-party assets.
Built on the structure of Princess Day.
