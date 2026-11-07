import type { Project } from '../core/model';
export const presets: Record<string, Partial<Project>> = {
  'Dark Ritual Meditation': { world: 'temple', intensity: .5, speed: .2, fog: .045, exposure: .9 },
  'Zen Dissociation': { world: 'garden', intensity: .7, speed: .25, fog: .025, exposure: 1.1 },
  'Hyperdimensional Bardo': { world: 'chambers', intensity: 1.2, speed: .55, fog: .035, exposure: 1.1 },
  'Ayahuasca Organic Visions': { world: 'organic', intensity: 1, speed: .35, fog: .03, exposure: 1 },
  'Infinite Mandala': { world: 'mandala', intensity: 1, speed: .4, fog: .025, exposure: 1.1 },
  'Temple of Echoes': { world: 'observers', intensity: .6, speed: .25, fog: .04, exposure: 1 },
  'Psycore Overdrive': { world: 'chambers', intensity: 1.6, speed: 1, fog: .02, exposure: 1.2 },
  'Slambient Deep Trance': { world: 'journey', intensity: .5, speed: .12, fog: .06, exposure: .85 },
  'Monochrome Void': { world: 'void', intensity: .25, speed: .1, fog: .05, exposure: .7 },
  'Slow Hypnotic Geometry': { world: 'mandala', intensity: .4, speed: .08, fog: .04, exposure: 1 },
  'Lotus Dream': { world: 'thousandPetals', intensity: .7, speed: .18, fog: .025, exposure: 1, audioGain: 1.2, surfaceFx: .4, psychedelic: .3, dissociation: .12, transitionStyle: 'lotus' },
  'Indra’s Prismatic Net': { world: 'indrasNet', intensity: .8, speed: .2, fog: .025, exposure: 1.05, audioGain: 1.5, surfaceFx: .65, psychedelic: .55, dissociation: .2, transitionStyle: 'prism' },
  'Bodhi Dissociation': { world: 'bodhiTree', intensity: .55, speed: .12, fog: .035, exposure: 1, audioGain: 1, surfaceFx: .35, psychedelic: .2, dissociation: .5, transitionStyle: 'dissolve' },
  'Forty-Four Worlds': { world: 'journey', intensity: .7, speed: .24, fog: .025, exposure: 1.05, audioGain: 1.3, surfaceFx: .45, psychedelic: .4, dissociation: .25, transition: 12, transitionStyle: 'auto' },
};
