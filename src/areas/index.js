import { buildMeadow } from './meadow.js';
import { buildValley } from './valley.js';
import { buildCave } from './cave.js';
import { buildKitchen } from './kitchen.js';
import { buildVolcano } from './volcano.js';
import { buildDig } from './dig.js';
import { buildParty } from './party.js';
import { buildJungle } from './jungle.js';
import { buildSnow } from './snow.js';
import { buildWaterhole } from './waterhole.js';
import { buildSeaFloor } from './seafloor.js';
import { buildFarm } from './farm.js';
import { buildStage } from './stage.js';
import { buildCircus } from './circus.js';
import { buildCamp } from './camp.js';
import { buildIce } from './ice.js';
import { buildSky } from './sky.js';

export const AREAS = {
  meadow: buildMeadow,
  valley: buildValley,
  cave: buildCave,
  kitchen: buildKitchen,
  volcano: buildVolcano,
  dig: buildDig,
  party: buildParty,
  jungle: buildJungle,
  snow: buildSnow,
  waterhole: buildWaterhole,
  seafloor: buildSeaFloor,
  farm: buildFarm,
  stage: buildStage,
  circus: buildCircus,
  camp: buildCamp,
  ice: buildIce,
  sky: buildSky,
};

// background music + ambient sounds for each place
export const AREA_SOUND = {
  meadow: { music: 'day', ambience: 'birds' },
  valley: { music: 'day', ambience: 'birds' },
  cave: { music: 'camp' },
  kitchen: { music: 'day', ambience: 'birds' },
  volcano: { music: 'volcano', ambience: 'crickets' },
  dig: { music: 'camp', ambience: 'wind' },
  party: { music: 'party', ambience: 'birds' },
  jungle: { music: 'jungle', ambience: 'birds' },
  snow: { music: 'winter', ambience: 'wind' },
  waterhole: { music: 'party', ambience: 'pool' },
  seafloor: { music: 'sea', ambience: 'bubbles' },
  farm: { music: 'day', ambience: 'birds' },
  stage: { music: 'party', ambience: 'birds' },
  circus: { music: 'party', ambience: 'birds' },
  camp: { music: 'camp', ambience: 'crickets' },
  ice: { music: 'winter', ambience: 'wind' },
  sky: { music: 'party' },
};
