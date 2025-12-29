// Type definitions for sprite atlas
export type SpriteFrame = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type SpriteData = {
  frame: SpriteFrame;
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  sourceSize: {
    w: number;
    h: number;
  };
  pivot: {
    x: number;
    y: number;
  };
};

export type SpriteAtlas = {
  frames: Record<string, SpriteData>;
  meta?: {
    app: string;
    version: string;
    image: string;
    format: string;
    size: { w: number; h: number };
    scale: number;
  };
};

type CharacterSpriteProps = {
  id: string;
  size?: { height: number; width: number }; // équivalent width/height
  className?: string;
};

import Image from 'next/image';
import spritesData from './spritesData.json';

export function Sprite({ id, size = { height: 81, width: 81 } }: CharacterSpriteProps) {
  const atlas = spritesData as SpriteAtlas;
  const key = id.endsWith('.png') ? id : `${id}.png`;
  const sprite = atlas.frames[key];

  const scale = sprite ? size.width / sprite.frame.w : 0;

  return (
    <>
      {sprite ? (
        <div
          role="img"
          style={{
            height: size.height,
            width: size.width,
            backgroundImage: "url('/characters/sprite-texture.png')",
            backgroundPosition: `-${sprite?.frame.x * scale}px -${sprite?.frame.y * scale}px`,
            backgroundSize: `${atlas.meta!.size.w * scale}px ${atlas.meta!.size.h * scale}px`,
            backgroundRepeat: 'no-repeat',
          }}
        />
      ) : (
        <Image src={`/characters/${id}.png`} alt={id} width={size.width} height={size.height} />
      )}
    </>
  );
}
