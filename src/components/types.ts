export type BoardState = {
  [cellId: string]: {
    location: string;
    characters: {
      id: string;
      position?: 'left' | 'right';
    }[];
  };
};

export type Card = {
  id: string;
  label: string;
  type: string;
  slots?: {
    maxCharacters: number;
    positions?: string[];
  };
};

export type Level = {
  id: string;
  shortTitle: string;
  title: string;
  cells: number;
  cardsCaracter: Card[];
  cardsPlace: Card[];
  victoryStates: BoardState[];
};

export type DebugJSONProps = {
  data: BoardState;
};

export type VictoryStatus = {
  achieved: boolean; // true si une condition de victoire est atteinte
  index?: number; // index du tableau victoryStates correspondant
  matchedState?: BoardState; // l'état du board qui a déclenché la victoire
  nbOferrors?: number;
};

export type VictoryStateDisplayProps = {
  victoryState: {
    achieved: boolean;
    index?: number;
    matchedState?: BoardState;
  };
};
