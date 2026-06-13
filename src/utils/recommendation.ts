import type { Signboard } from '../types';

export interface MatchResult {
  signboard: Signboard;
  score: number;
  matchDetails: {
    locationScore: number;
    eraScore: number;
    styleScore: number;
    locationMatch: string;
    eraMatch: string;
    styleMatch: string;
  };
}

const extractLocationParts = (location: string) => {
  const cityMatch = location.match(/^(北京|上海|广州|杭州|香港)/);
  const districtMatch = location.match(/(.*?区)/);
  const streetMatch = location.match(/区(.*?)(路|街|巷|胡同)/);

  return {
    city: cityMatch ? cityMatch[0] : '',
    district: districtMatch ? districtMatch[1] : '',
    street: streetMatch ? streetMatch[1].trim() : ''
  };
};

const calculateLocationScore = (a: Signboard, b: Signboard): { score: number; match: string } => {
  const locA = extractLocationParts(a.location);
  const locB = extractLocationParts(b.location);

  if (a.location === b.location) {
    return { score: 100, match: `同街道：${locA.street || a.location}` };
  }

  if (locA.district && locB.district && locA.district === locB.district) {
    return { score: 75, match: `同区域：${locA.district}` };
  }

  if (locA.city && locB.city && locA.city === locB.city) {
    return { score: 40, match: `同城市：${locA.city}` };
  }

  return { score: 0, match: '不同城市' };
};

const calculateEraScore = (a: Signboard, b: Signboard): { score: number; match: string } => {
  if (a.era === b.era) {
    return { score: 100, match: `同年代：${a.era}` };
  }

  const yearDiff = Math.abs(a.year - b.year);

  if (yearDiff <= 10) {
    return { score: 75, match: `年代相近：相差${yearDiff}年` };
  }

  if (yearDiff <= 20) {
    return { score: 45, match: `年代较近：相差${yearDiff}年` };
  }

  if (yearDiff <= 50) {
    return { score: 20, match: `年代较远：相差${yearDiff}年` };
  }

  return { score: 0, match: `年代久远：相差${yearDiff}年` };
};

const calculateStyleScore = (a: Signboard, b: Signboard): { score: number; match: string } => {
  let score = 0;
  const matches: string[] = [];

  if (a.fontStyle === b.fontStyle) {
    score += 50;
    matches.push(`同字体：${a.fontStyle}`);
  }

  if (a.buildingType === b.buildingType) {
    score += 30;
    matches.push(`同建筑：${a.buildingType}`);
  }

  const commonTags = a.tags.filter(tag => b.tags.includes(tag));
  if (commonTags.length > 0) {
    const tagScore = Math.min(commonTags.length * 10, 20);
    score += tagScore;
    matches.push(`标签重合：${commonTags.slice(0, 2).join('、')}`);
  }

  if (matches.length === 0) {
    return { score: 0, match: '风格差异较大' };
  }

  return { score, match: matches.join(' | ') };
};

export const calculateSimilarity = (a: Signboard, b: Signboard): MatchResult => {
  const locationResult = calculateLocationScore(a, b);
  const eraResult = calculateEraScore(a, b);
  const styleResult = calculateStyleScore(a, b);

  const locationWeight = 0.4;
  const eraWeight = 0.35;
  const styleWeight = 0.25;

  const totalScore =
    locationResult.score * locationWeight +
    eraResult.score * eraWeight +
    styleResult.score * styleWeight;

  return {
    signboard: b,
    score: Math.round(totalScore * 10) / 10,
    matchDetails: {
      locationScore: locationResult.score,
      eraScore: eraResult.score,
      styleScore: styleResult.score,
      locationMatch: locationResult.match,
      eraMatch: eraResult.match,
      styleMatch: styleResult.match
    }
  };
};

export const getNeighborhoodRecommendations = (
  targetSignboard: Signboard,
  allSignboards: Signboard[],
  options: { limit?: number; minScore?: number } = {}
): MatchResult[] => {
  const { limit = 6, minScore = 15 } = options;

  return allSignboards
    .filter(s => s.id !== targetSignboard.id)
    .map(s => calculateSimilarity(targetSignboard, s))
    .filter(result => result.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};
