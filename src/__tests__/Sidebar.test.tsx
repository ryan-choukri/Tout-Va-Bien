import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Sidebar } from '../components/Sidebar';
import { Level } from '../components/types';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

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
  {
    id: 'level_storyteller_2',
    shortTitle: 'Level 2',
    title: 'Second Level',
    cells: 6,
    cardsCaracter: [],
    cardsPlace: [],
    victoryStates: [],
  },
  {
    id: 'level_storyteller_0create',
    shortTitle: 'Create Level',
    title: 'Creation Mode',
    cells: 0,
    cardsCaracter: [],
    cardsPlace: [],
    victoryStates: [],
  },
];

describe('Sidebar Component', () => {
  const defaultProps = {
    levels: mockLevels,
    currentLevel: null,
    sidebarCollapsed: false,
    onToggleCollapse: jest.fn(),
    onSelectLevel: jest.fn(),
    devMode: false,
    communityLevelsCount: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('should render sidebar with all levels', () => {
      render(<Sidebar {...defaultProps} />);

      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('Level 2')).toBeInTheDocument();
      expect(screen.getByText('Create Level')).toBeInTheDocument();
    });

    test('should render home button with correct text when expanded', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Tout va bien !')).toBeInTheDocument();
    });

    test('should render description text when not collapsed', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText(/Place les personnages aux bons endroits/)).toBeInTheDocument();
    });
  });

  describe('Collapsed State', () => {
    test('should hide description when collapsed', () => {
      const { container } = render(<Sidebar {...defaultProps} sidebarCollapsed={true} />);
      const descriptionDiv = container.querySelector('.hidden');
      expect(descriptionDiv).toBeInTheDocument();
    });

    test('should show home icon instead of text when collapsed', () => {
      render(<Sidebar {...defaultProps} sidebarCollapsed={true} />);
      expect(screen.queryByText('Tout va bien !')).not.toBeInTheDocument();
      // Home icon should be present (we can't easily test SVG content, so we check for the button)
      const homeButton = screen.getByTitle("Retour à l'accueil");
      expect(homeButton).toBeInTheDocument();
    });

    test('should apply correct CSS classes for collapsed state', () => {
      const { container } = render(<Sidebar {...defaultProps} sidebarCollapsed={true} />);
      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('w-14');
    });

    test('should apply correct CSS classes for expanded state', () => {
      const { container } = render(<Sidebar {...defaultProps} sidebarCollapsed={false} />);
      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('w-48');
    });
  });

  describe('Level Types and Styling', () => {
    test('should show create level with "+" badge', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('+')).toBeInTheDocument();
    });

    test('should show regular levels with number badges', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    test('should show community levels with "C" badge when in dev mode', () => {
      const levelsWithCommunity = [
        ...mockLevels,
        {
          id: 'community_create_1',
          shortTitle: 'Community Level 1',
          title: 'User Created Level',
          cells: 4,
          cardsCaracter: [],
          cardsPlace: [],
          victoryStates: [],
        },
      ];

      render(
        <Sidebar
          {...defaultProps}
          levels={levelsWithCommunity}
          devMode={true}
          communityLevelsCount={1}
        />
      );

      expect(screen.getByText('C')).toBeInTheDocument();
    });
  });

  describe('Active Level State', () => {
    test('should highlight active level', () => {
      render(<Sidebar {...defaultProps} currentLevel={mockLevels[0]} />);

      const levelButton = screen.getByText('Level 1').closest('button');
      expect(levelButton).toHaveClass('bg-gradient-to-r', 'from-indigo-600', 'to-indigo-500');
    });

    test('should not highlight inactive levels', () => {
      render(<Sidebar {...defaultProps} currentLevel={mockLevels[0]} />);

      const inactiveButton = screen.getByText('Level 2').closest('button');
      expect(inactiveButton).not.toHaveClass('from-indigo-600');
    });
  });

  describe('User Interactions', () => {
    test('should call onToggleCollapse when toggle button is clicked', () => {
      const mockToggle = jest.fn();
      render(<Sidebar {...defaultProps} onToggleCollapse={mockToggle} />);

      const toggleButton = screen.getByTitle('Collapse sidebar');
      fireEvent.click(toggleButton);

      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    test('should call onSelectLevel when level is clicked', () => {
      const mockSelectLevel = jest.fn();
      render(<Sidebar {...defaultProps} onSelectLevel={mockSelectLevel} />);

      const levelButton = screen.getByText('Level 1');
      fireEvent.click(levelButton);

      expect(mockSelectLevel).toHaveBeenCalledWith(mockLevels[0], 0);
    });

    test('should navigate home when home button is clicked', () => {
      render(<Sidebar {...defaultProps} />);

      const homeButton = screen.getByText('Tout va bien !');
      fireEvent.click(homeButton);

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('Dev Mode Features', () => {
    test('should show community levels subtitle in dev mode', () => {
      const levelsWithCommunity = [
        ...mockLevels,
        {
          id: 'community_create_1',
          shortTitle: 'Community Level 1',
          title: 'User Created Level',
          cells: 4,
          cardsCaracter: [],
          cardsPlace: [],
          victoryStates: [],
        },
      ];

      render(
        <Sidebar
          {...defaultProps}
          levels={levelsWithCommunity}
          devMode={true}
          communityLevelsCount={1}
        />
      );

      expect(screen.getByText('Levels de la commu')).toBeInTheDocument();
    });

    test('should not show community levels subtitle when not in dev mode', () => {
      const levelsWithCommunity = [
        ...mockLevels,
        {
          id: 'community_create_1',
          shortTitle: 'Community Level 1',
          title: 'User Created Level',
          cells: 4,
          cardsCaracter: [],
          cardsPlace: [],
          victoryStates: [],
        },
      ];

      render(
        <Sidebar
          {...defaultProps}
          levels={levelsWithCommunity}
          devMode={false}
          communityLevelsCount={1}
        />
      );

      expect(screen.queryByText('Levels de la commu')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper titles for collapsed buttons', () => {
      render(<Sidebar {...defaultProps} sidebarCollapsed={true} />);

      const levelButtons = screen.getAllByRole('button');
      const levelButton = levelButtons.find((btn) => btn.getAttribute('title') === 'Level 1');
      expect(levelButton).toBeInTheDocument();
    });

    test('should have proper toggle button title', () => {
      render(<Sidebar {...defaultProps} sidebarCollapsed={false} />);
      expect(screen.getByTitle('Collapse sidebar')).toBeInTheDocument();
    });

    test('should update toggle button title when collapsed', () => {
      render(<Sidebar {...defaultProps} sidebarCollapsed={true} />);
      expect(screen.getByTitle('Expand sidebar')).toBeInTheDocument();
    });
  });
});
