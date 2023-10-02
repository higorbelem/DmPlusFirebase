export type StatTypes = 'normal' | 'risk' | 'urgent';

export type StatType = {
  [key in StatTypes]: number;
};
