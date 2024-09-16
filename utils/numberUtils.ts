// utils/numberUtils.ts
export const abbreviateNumber = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const parseAbbreviatedNumber = (value: string | null): number => {
  if (value === null) return 0;
  const multiplier = value.charAt(value.length - 1).toLowerCase();
  const number = parseFloat(value);
  switch (multiplier) {
    case 'k': return number * 1000;
    case 'm': return number * 1000000;
    default: return number;
  }
};