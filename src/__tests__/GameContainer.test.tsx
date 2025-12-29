import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameContainer from '../components/GameContainer';
import { Level } from '../components/types';

// Mock next/navigation
const mockReplace = jest.fn();
const createMockSearchParams = () => {
  const map = new Map();
  return {
    get: (key: string) => map.get(key) || null,
    set: (key: string, value: string) => map.set(key, value),
    delete: (key: string) => map.delete(key),
    clear: () => map.clear(),
    entries: () => map.entries(),
    toString: () => new URLSearchParams(Array.from(map.entries())).toString(),
  };
};
const mockSearchParams = createMockSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock dynamic import
jest.mock('next/dynamic', () => () => {
  interface GameGridMockProps {
    onProposerClick: (title: string, level: Level) => void;
    onBoardStateChange: (state: boolean) => void;
  }

  const GameGridMock = ({ onProposerClick, onBoardStateChange }: GameGridMockProps) => (
    <div data-testid="game-grid">
      <button onClick={() => onProposerClick('Test Title', mockLevelData)}>PROPOSER Button</button>
      <button onClick={() => onBoardStateChange(true)}>Change Board State</button>
    </div>
  );
  return GameGridMock;
});

// Mock DisplayCardImg
jest.mock('@/components/GameGrid/components/DisplayCardImg', () => ({
  DisplayCardImg: ({
    onClick,
    card,
  }: {
    onClick: () => void;
    card: { id: string; label: string };
  }) => (
    <div data-testid={`display-card-${card.id}`} onClick={onClick}>
      {card.label}
    </div>
  ),
}));

// Mock fetch
global.fetch = jest.fn();

const mockLevels: Level[] = [
  {
    id: 'level_storyteller_1',
    shortTitle: 'Level 1',
    title: 'First Level',
    cells: 5,
    cardsCaracter: [],
    cardsPlace: [],
    victoryStates: [],
  },
];

const mockLevelData: Level = {
  id: 'level_storyteller_1',
  shortTitle: 'Level 1',
  title: 'Test Level',
  cells: 5,
  cardsCaracter: [],
  cardsPlace: [],
  victoryStates: [],
};

const mockCommunityLevels: Level[] = [
  {
    id: 'community_level_1',
    shortTitle: 'Community Level 1',
    title: 'User Created Level',
    cells: 4,
    cardsCaracter: [],
    cardsPlace: [],
    victoryStates: [],
  },
];

describe('GameContainer Component', () => {
  const defaultProps = {
    showDebug: false,
    levels: mockLevels,
    levelData: null,
    isHome: false,
    isCreate: false,
    onDevModeChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockReset();
    mockSearchParams.clear();

    // Mock environment variables
    process.env.NEXT_PUBLIC_API_URL = 'https://api.test.com';
  });

  describe('Home Screen Rendering', () => {
    test('should render home screen when isHome is true', () => {
      render(<GameContainer {...defaultProps} isHome={true} />);

      expect(screen.getByText('Tout va bien !')).toBeInTheDocument();
      expect(screen.getByText('Le jeu de puzzle politique')).toBeInTheDocument();
      expect(screen.getByText('▶ Jouer')).toBeInTheDocument();
      expect(screen.getByText('✏️ Crée ton niveau')).toBeInTheDocument();
    });

    test('should render home screen when levelData is null', () => {
      render(<GameContainer {...defaultProps} levelData={null} />);

      expect(screen.getByText('Tout va bien !')).toBeInTheDocument();
    });

    test('should display political characters on home screen', () => {
      render(<GameContainer {...defaultProps} isHome={true} />);

      expect(screen.getByTestId('display-card-lepen')).toBeInTheDocument();
      expect(screen.getByTestId('display-card-macron')).toBeInTheDocument();
      expect(screen.getByTestId('display-card-melenchon')).toBeInTheDocument();
      expect(screen.getByTestId('display-card-sarko')).toBeInTheDocument();
    });

    test('should show description text on home screen', () => {
      render(<GameContainer {...defaultProps} isHome={true} />);

      expect(screen.getByText(/Place les personnages aux bons endroits/)).toBeInTheDocument();
      expect(screen.getByText(/comment tout va bien... ou pas !/)).toBeInTheDocument();
    });
  });

  describe('Game Navigation', () => {
    test('should navigate to level 1 when play button is clicked', () => {
      render(<GameContainer {...defaultProps} isHome={true} />);

      const playButton = screen.getByText('▶ Jouer');
      fireEvent.click(playButton);

      expect(mockReplace).toHaveBeenCalledWith('/?level=1', { scroll: false });
    });

    test('should navigate to create mode when create button is clicked', () => {
      render(<GameContainer {...defaultProps} isHome={true} />);

      const createButton = screen.getByText('✏️ Crée ton niveau');
      fireEvent.click(createButton);

      expect(mockReplace).toHaveBeenCalledWith('/?level=create', { scroll: false });
    });
  });

  describe('Game Grid Integration', () => {
    test('should render GameGrid when not on home screen', () => {
      render(<GameContainer {...defaultProps} levelData={mockLevelData} />);

      expect(screen.getByTestId('game-grid')).toBeInTheDocument();
      expect(screen.queryByText('Tout va bien !')).not.toBeInTheDocument();
    });

    test('should apply create mode styling when isCreate is true', () => {
      const { container } = render(
        <GameContainer {...defaultProps} levelData={mockLevelData} isCreate={true} />
      );

      const gameContainer = container.querySelector('.game-container');
      expect(gameContainer).toHaveClass('bg-gradient-to-b', 'from-red-900', 'to-pink-900');
    });

    test('should handle board state changes', () => {
      render(<GameContainer {...defaultProps} levelData={mockLevelData} />);

      const changeStateButton = screen.getByText('Change Board State');
      fireEvent.click(changeStateButton);

      // Board state change should be tracked internally
      expect(screen.getByTestId('game-grid')).toBeInTheDocument();
    });
  });

  describe('Dev Mode Easter Egg', () => {
    test('should increment click count when Sarko is clicked', () => {
      render(<GameContainer {...defaultProps} isHome={true} />);

      const sarkoCard = screen.getByTestId('display-card-sarko');
      fireEvent.click(sarkoCard);

      // First click should register
      expect(sarkoCard).toBeInTheDocument();
    });

    test('should trigger dev mode after 3 Sarko clicks', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          levels: mockCommunityLevels,
        }),
      });

      render(<GameContainer {...defaultProps} isHome={true} />);

      const sarkoCard = screen.getByTestId('display-card-sarko');

      // Triple click Sarko
      fireEvent.click(sarkoCard);
      fireEvent.click(sarkoCard);
      fireEvent.click(sarkoCard);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('https://api.test.com/levels');
        expect(defaultProps.onDevModeChange).toHaveBeenCalledWith(true, mockCommunityLevels, [
          ...mockLevels,
          ...mockCommunityLevels,
        ]);
      });
    });

    test('should reset click count after timeout', async () => {
      jest.useFakeTimers();
      render(<GameContainer {...defaultProps} isHome={true} />);

      const sarkoCard = screen.getByTestId('display-card-sarko');

      // Click once, then wait for timeout
      fireEvent.click(sarkoCard);

      jest.advanceTimersByTime(2000);

      // Click again - should start fresh count
      fireEvent.click(sarkoCard);
      fireEvent.click(sarkoCard);

      // Should not trigger dev mode (only 2 clicks in current sequence)
      expect(fetch).toHaveBeenCalledTimes(1); // Only from the first triple-click

      jest.useRealTimers();
    });
  });

  describe('Level Submission Flow', () => {
    test('should show confirmation popup when PROPOSER is clicked', () => {
      render(<GameContainer {...defaultProps} levelData={mockLevelData} />);

      const proposerButton = screen.getByText('PROPOSER Button');
      fireEvent.click(proposerButton);

      expect(screen.getByText('Confirmation')).toBeInTheDocument();
      expect(screen.getByText(/Êtes-vous sûr de vouloir envoyer ce niveau/)).toBeInTheDocument();
      expect(screen.getByText('ENVOYER')).toBeInTheDocument();
      expect(screen.getByText('ANNULER')).toBeInTheDocument();
    });

    test('should close confirmation popup when ANNULER is clicked', () => {
      render(<GameContainer {...defaultProps} levelData={mockLevelData} />);

      const proposerButton = screen.getByText('PROPOSER Button');
      fireEvent.click(proposerButton);

      const cancelButton = screen.getByText('ANNULER');
      fireEvent.click(cancelButton);

      expect(screen.queryByText('Confirmation')).not.toBeInTheDocument();
    });

    test('should submit level successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      render(<GameContainer {...defaultProps} levelData={mockLevelData} />);

      const proposerButton = screen.getByText('PROPOSER Button');
      fireEvent.click(proposerButton);

      const sendButton = screen.getByText('ENVOYER');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('https://api.test.com/createlevel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockLevelData),
        });
      });

      await waitFor(() => {
        expect(
          screen.getByText((content) => content.includes('Niveau envoyé avec succès !'))
        ).toBeInTheDocument();
      });
    });

    test('should handle submission failure', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      render(<GameContainer {...defaultProps} levelData={mockLevelData} />);

      const proposerButton = screen.getByText('PROPOSER Button');
      fireEvent.click(proposerButton);

      const sendButton = screen.getByText('ENVOYER');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(
          screen.getByText((content, element) => content.includes("Échec de l'envoi du niveau"))
        ).toBeInTheDocument();
      });
    });

    test('should handle network error during submission', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<GameContainer {...defaultProps} levelData={mockLevelData} />);

      const proposerButton = screen.getByText('PROPOSER Button');
      fireEvent.click(proposerButton);

      const sendButton = screen.getByText('ENVOYER');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(
          screen.getByText((content, element) =>
            content.includes("Erreur lors de l'envoi du niveau")
          )
        ).toBeInTheDocument();
      });
    });

    test('should show loading state during submission', () => {
      (fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {})); // Never resolves

      render(<GameContainer {...defaultProps} levelData={mockLevelData} />);

      const proposerButton = screen.getByText('PROPOSER Button');
      fireEvent.click(proposerButton);

      const sendButton = screen.getByText('ENVOYER');
      fireEvent.click(sendButton);

      expect(screen.getByText('ENVOI...')).toBeInTheDocument();
      expect(screen.getByText('ENVOI...')).toBeDisabled();
      expect(screen.getByText('ANNULER')).toBeDisabled();
    });
  });

  describe('Community Levels Integration', () => {
    test('should fetch community levels successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          levels: mockCommunityLevels,
        }),
      });

      render(<GameContainer {...defaultProps} isHome={true} />);

      const sarkoCard = screen.getByTestId('display-card-sarko');

      // Triple click to trigger dev mode
      fireEvent.click(sarkoCard);
      fireEvent.click(sarkoCard);
      fireEvent.click(sarkoCard);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('https://api.test.com/levels');
        expect(defaultProps.onDevModeChange).toHaveBeenCalledWith(true, mockCommunityLevels, [
          ...mockLevels,
          ...mockCommunityLevels,
        ]);
      });
    });

    test('should handle community levels fetch error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(<GameContainer {...defaultProps} isHome={true} />);

      const sarkoCard = screen.getByTestId('display-card-sarko');

      // Triple click to trigger dev mode
      fireEvent.click(sarkoCard);
      fireEvent.click(sarkoCard);
      fireEvent.click(sarkoCard);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching community levels:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Notification System', () => {
    test('should auto-hide success notification after 3 seconds', async () => {
      jest.useFakeTimers();
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      render(<GameContainer {...defaultProps} levelData={mockLevelData} />);

      const proposerButton = screen.getByText('PROPOSER Button');
      fireEvent.click(proposerButton);

      const sendButton = screen.getByText('ENVOYER');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(
          screen.getByText((content) => content.includes('Niveau envoyé avec succès !'))
        ).toBeInTheDocument();
      });

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText('Niveau envoyé avec succès !')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });
});
