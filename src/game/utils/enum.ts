export const GAME_RESOLUTION = {
  WIDTH: 720,
  HEIGHT: 1080,
} as const;

export const BubbleType = {
  NONE: -1,
  RED: 0,
  YELLOW: 1,
  GREEN: 2,
  TEAL: 3,
  BLUE: 4,
  PURPLE: 5,
  PINK: 6,
} as const;

export type BubbleType = (typeof BubbleType)[keyof typeof BubbleType];

export const Events = {
  BUBBLE_COLLISION: "bubble_collision",
  BUBBLE_SHOOT: "bubble_shoot",
  BUBBLE_POP_AFTER: "bubble_pop_after",
  GAME_OVER: "game_over",
  YOU_WIN: "you_win",
  RELOAD_CANNON: "reload_cannon",
} as const;

export type Events = (typeof Events)[keyof typeof Events];

export interface BubbleCollisionEvent {
  bubbleA: number;
  bubbleB: number;
  velocityX: number;
  velocityY: number;
}

export interface BubblePopAfterEvent {
  missed: boolean;
}
