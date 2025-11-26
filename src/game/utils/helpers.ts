import type { Container, Graphics } from "pixi.js";
import { BubbleType, GAME_RESOLUTION } from "./enum";
import type { Entity } from "../../engine/ecs/types";
import type { PositionComponent } from "../components/position-component";
import { TweenComponent } from "../components/tween-component";

export function fitContainerToScreen(
  container: Container,
  screenWidth: number,
  screenHeight: number,
  logicalWidth: number = GAME_RESOLUTION.WIDTH,
  logicalHeight: number = GAME_RESOLUTION.HEIGHT
) {
  const gameRatio = logicalWidth / logicalHeight;
  const screenRatio = screenWidth / screenHeight;

  let scale: number;

  if (screenRatio > gameRatio) {
    scale = screenHeight / logicalHeight;
  } else {
    scale = screenWidth / logicalWidth;
  }

  container.scale.set(scale);

  const scaledWidth = logicalWidth * scale;
  const scaledHeight = logicalHeight * scale;

  container.position.set((screenWidth - scaledWidth) / 2, screenHeight / scaledHeight / 2);

  return scale;
}

export function collisionDetected(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const radii = r1 + r2;

  if (dx * dx + dy * dy < radii * radii) {
    return true;
  }

  return false;
}

export function getDirectionFromVelocity(vx: number, vy: number) {
  const distance = Math.sqrt(vx * vx + vy * vy);
  if (distance === 0) return { x: 0, y: 0 }; // no movement
  return { x: vx / distance, y: vy / distance };
}

export function getRandomBubbleType(): BubbleType {
  const bubbleTypes = Object.values(BubbleType)
    .map((val) => val)
    .filter((val) => !Number.isNaN(val) && val !== -1);
  const randomIndex = Math.floor(Math.random() * bubbleTypes.length);

  return randomIndex as unknown as BubbleType;
}

export function tweenToAsync(
  entity: Entity,
  target: PositionComponent,
  to: { x: number; y: number },
  duration = 0.8
) {
  return new Promise<void>((resolve) => {
    entity.addComponent(
      new TweenComponent([
        {
          mode: "to",
          target: target,
          to: {
            x: to.x,
            y: to.y,
          },
          duration: duration,
          onComplete: () => {
            resolve();
          },
        },
      ])
    );
  });
}

export function generateRandomId(length: number = 8): string {
  return Math.random().toString(36).substr(2, length);
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://stackoverflow.com/questions/79609396/how-do-i-draw-a-dashed-line
export function drawDashedLine(g: Graphics, points: [number, number][], dash = 10, gap = 5): void {
  g.setStrokeStyle({
    width: 2,
    color: 0xffffff,
    cap: "butt", // important to avoid circular dash ends
    join: "miter",
  });

  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];

    const dx = x2 - x1;
    const dy = y2 - y1;
    const segmentLength = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    let distance = 0;

    while (distance < segmentLength) {
      const nextDistance = Math.min(distance + dash, segmentLength);

      const xStart = x1 + Math.cos(angle) * distance;
      const yStart = y1 + Math.sin(angle) * distance;
      const xEnd = x1 + Math.cos(angle) * nextDistance;
      const yEnd = y1 + Math.sin(angle) * nextDistance;

      g.moveTo(xStart, yStart);
      g.lineTo(xEnd, yEnd);

      distance += dash + gap;
    }
  }
}
