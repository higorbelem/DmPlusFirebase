
export type GlicoseLevelType =
| "crit-low"
| "low"
| "normal"
| "high"
| "crit-high";

export const glicoseParameters: {
[key in GlicoseLevelType]: {min: number; max: number};
} = {
"crit-low": {min: 0, max: 50},
"low": {min: 51, max: 70},
"normal": {min: 71, max: 149},
"high": {min: 150, max: 349},
"crit-high": {min: 350, max: Number.MAX_VALUE},
};

export const getGlicoseStatus = (glicose: number): GlicoseLevelType => {
if (glicose <= glicoseParameters["crit-low"].max) {
  return "crit-low";
}

if (glicose <= glicoseParameters.low.max) {
  return "low";
}

if (glicose <= glicoseParameters.normal.max) {
  return "normal";
}

if (glicose <= glicoseParameters.high.max) {
  return "high";
}

return "crit-high";
};
