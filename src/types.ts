export type RingerMode = 'silent' | 'vibrate' | 'ring';

export interface Place {
  lat: number;
  lng: number;
  /** metres */
  radius: number;
}

export interface Rule {
  id: string;
  name: string;
  enabled: boolean;
  mode: RingerMode;
  /** 0..6, Sunday = 0 */
  days: number[];
  /** minutes since midnight. start === end means "all day". end < start means overnight. */
  startMin: number;
  endMin: number;
  /** When set, the rule only applies while the phone is inside this circle. */
  place?: Place;
}
