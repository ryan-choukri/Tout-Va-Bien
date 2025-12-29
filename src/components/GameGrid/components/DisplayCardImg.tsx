import { Card } from '@/components/types';
import { JSX } from 'react';
import { Sprite } from '@/components/ui/Sprite';
import Image from 'next/image';

export function DisplayCardImg({
  card,
  style,
  styleForImage,
  haveLabel = true,
  onClick,
}: {
  card: Card | undefined | null;
  style?: React.CSSProperties;
  styleForImage?: { height: number; width: number };
  haveLabel?: boolean;
  onClick?: () => void;
}): JSX.Element | null {
  return card && card.type === 'character' ? (
    <>
      <div style={style ? style : { bottom: '0px' }} className="absolute mb-2" onClick={onClick}>
        {/* <Image
          src={`/characters/${card.id}.png`}
          alt={'Character Image'}
          width={650}
          height={650}
        /> */}
        <Sprite
          id={card.id}
          size={styleForImage ? styleForImage : { height: 81, width: 81 }}
          className="absolute"
        />
      </div>
      {haveLabel && (
        <p className="absolute text-sm text-shadow-lg" style={{ bottom: '-4px' }}>
          {card?.label}
        </p>
      )}
    </>
  ) : (
    <>
      <div
        className="absolute"
        style={style ? style : { zIndex: -8, bottom: '-8px', left: '-4px' }}
        onClick={onClick}>
        {/* <Sprite id={'card'} size={{ height: 54, width: 97 }} className="absolute" /> */}
        <Image src={`/characters/card.png`} alt={'Location Image'} width={190} height={190} />
      </div>
      {haveLabel && card?.label}
    </>
  );
}
