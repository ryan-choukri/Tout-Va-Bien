import Image from 'next/image';
import { Card } from '@/components/types';
import { JSX } from 'react';

export function DisplayCardImg(
  card: Card | undefined | null,
  style?: React.CSSProperties
): JSX.Element | null {
  return card && card.type === 'character' ? (
    <>
      <div style={style ? style : { bottom: '0px' }} className="absolute mb-2">
        <Image
          src={`/characters/${card.id}.png`}
          alt={'Character Image'}
          width={650}
          height={650}
        />
      </div>
      <p className="absolute text-xs" style={{ bottom: '-4px' }}>
        {' '}
        {card?.label}
      </p>
    </>
  ) : (
    <>
      {' '}
      <div
        className="absolute"
        style={style ? style : { zIndex: -8, bottom: '-8px', left: '-4px' }}
      >
        <Image src={`/characters/card.png`} alt={'Location Image'} width={510} height={510} />
      </div>
      {card?.label}
    </>
  );
}
