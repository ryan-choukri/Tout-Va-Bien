# Storyteller MVP - Documentation

## 📋 Project Overview

Storyteller is a political card game where players strategically place character and location cards to achieve specific victory conditions. Navigate through 11 challenging levels featuring French political figures in scenarios like presidential impeachment, popularity contests, and more.

## 🎮 Game Features

### Core Gameplay

- **Character Cards**: Political figures like Macron, Mélenchon, Le Pen, and others
- **Location Cards**: Strategic locations like "Eviction", "Popularité" with specific placement rules
- **Level Progression**: 11 levels with unique victory conditions
- **Strategic Gameplay**: Position-based mechanics where character placement matters

### Create Level Mode

- **Custom Level Creation**: Users can create their own levels
- **Real-time Validation**: Button disabled until changes are made to the board
- **Title Customization**: Editable textarea for level titles
- **Submission System**: Secure API submission with confirmation popup

## 🚀 Technical Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit/core
- **State Management**: React useState/useEffect hooks

## 🔧 API Integration

### Environment Setup

```env
# .env.local
API_URL=http://localhost:3001
EXTERNAL_API_KEY=your-api-key-here
```

### API Routes

#### POST /api/newlevel

- **Purpose**: Submit user-created levels
- **Target**: `${API_URL}/createlevel`
- **Security**: API key hidden on server-side
- **Data**: Complete level data including title, board state, and level structure

#### GET /api/levels

- **Purpose**: Fetch community-created levels
- **Target**: `${API_URL}/levels/`
- **Response**: Array of community levels

## 🎨 UI Components

### GameContainer

- **Background**: Conditional red/pink gradient for create mode
- **Popup System**: Centered confirmation dialogs
- **Notification System**: Green/red status alerts
- **State Management**: Handles dev mode and community levels

### Sidebar

- **Collapsible Design**: Mobile-responsive sidebar
- **Home Navigation**: Clickable title/home icon
- **Level Selection**: Visual feedback for active levels
- **Dev Mode Features**: Community levels section with orange styling

### GameGrid

- **Drag & Drop**: Intuitive card placement system
- **Victory Detection**: Real-time win condition checking
- **Board State**: Dynamic cell management
- **Debug Mode**: Development tools and JSON display

## 🔐 Security Features

- **API Proxy**: All external API calls go through Next.js API routes
- **Environment Variables**: Sensitive data hidden from client
- **Data Validation**: Server-side validation before external API calls
- **Error Handling**: Comprehensive error catching and user feedback

## 🛠️ Development Features

### Dev Mode (Easter Egg)

- **Activation**: Triple-click on Sarko image on homepage
- **Community Levels**: Fetches and displays user-submitted levels
- **Visual Distinction**: Orange styling for community content
- **Sidebar Integration**: "Levels de la commu" subtitle

### Debug Mode

- **Toggle**: Wrench icon (bottom-right)
- **Features**: JSON board state viewer, victory conditions, level data
- **Environment**: Controlled by `NEXT_PUBLIC_SHOW_DEBUG`

## 📱 Responsive Design

- **Mobile Detection**: Automatic sidebar collapse on touch devices
- **Orientation Hints**: Landscape mode recommendations
- **Adaptive Layout**: Flexible grid system
- **Touch Optimization**: Enhanced touch targets for mobile

## 🎯 Key Features Implemented

### Level Creation System

1. **Board State Tracking**: Detects changes from initial empty state
2. **Smart Validation**: Button only enabled when actual changes made
3. **API Integration**: Secure submission to external API
4. **User Feedback**: Loading states and success/error notifications

### Community Integration

1. **Hidden Activation**: Triple-click easter egg for dev access
2. **Dynamic Loading**: Fetches community levels on demand
3. **Seamless Integration**: Merges with existing level navigation
4. **Visual Hierarchy**: Clear distinction between static and community content

### Navigation System

1. **URL-based Routing**: Clean URL structure for level navigation
2. **Exception Handling**: Special routing for create mode
3. **Home Navigation**: Multiple ways to return to homepage
4. **State Persistence**: Maintains level selection across navigation

## 🔄 State Management

### Global State (page.tsx)

- `allLevels`: Combined static + community levels
- `devMode`: Easter egg activation status
- `communityLevelsCount`: Count for sidebar display
- `currentLevel`: Active level data

### Local State (Components)

- **GameContainer**: Popup visibility, notifications, submission status
- **GameGrid**: Board state, drag state, victory conditions
- **Sidebar**: Collapse state, navigation handling

## 📋 Setup Instructions

1. **Clone Repository**
2. **Install Dependencies**: `npm install`
3. **Environment Setup**: Configure `.env.local` with API endpoints
4. **Development**: `npm run dev`
5. **Production**: `npm run build && npm run start`

## 🐛 Known Considerations

- Community levels require external API to be running
- Dev mode is session-only (resets on page reload)
- Mobile landscape orientation recommended for best experience
- API rate limiting not implemented (should be added for production)

## 📈 Future Enhancements

- User authentication system
- Level rating and moderation
- Advanced level editor with visual tools
- Multiplayer functionality
- Level sharing and social features
