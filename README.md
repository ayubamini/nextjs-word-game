# Word Puzzle Game

A beautiful, engaging daily word guessing game built with Next.js and TypeScript, inspired by Wordle.

![image](https://github.com/user-attachments/assets/bee1784f-c0ba-43ed-8d47-0c6f13cac486)

## 🎮 Live Demo

[Play Word Puzzle Game](https://your-demo-link-here.vercel.app)

## ✨ Features

- **Daily Challenge**: A new word to guess every day
- **Limited Attempts**: Just like Wordle, players have six tries to guess the daily word
- **Visual Feedback**: Color-coded tiles indicate correct letters and positions
- **Score Tracking**: Player statistics and leaderboard functionality
- **Countdown Timer**: Shows time until the next daily puzzle
- **Theme Switching**: Toggle between light and dark modes with smooth transitions
- **Responsive Design**: Optimized for both desktop and mobile
- **Animations**: Polished interactions and visual feedback throughout the game
- **Modern UI**: Sleek design with gradient effects and glass morphism

## 🚀 Tech Stack

- **Next.js**: React framework for server-rendered applications
- **TypeScript**: For type safety and better developer experience
- **Tailwind CSS**: For utility-first styling
- **Framer Motion**: For smooth animations and transitions
- **Local Storage**: For persisting game state and player preferences

## 📋 How to Play

1. Try to guess the secret 5-letter word in six attempts or fewer
2. After each guess, the color of the tiles will change:
   - **Green**: The letter is correct and in the right position
   - **Yellow**: The letter is correct but in the wrong position
   - **Gray**: The letter is not in the word
3. Continue guessing until you either solve the puzzle or run out of attempts
4. A new word is available each day

## 🛠️ Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/word-puzzle-game.git
   cd word-puzzle-game
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to play the game locally

## 🧩 Project Structure

The game is implemented in a single file (`pages/index.tsx`) for simplicity, but it can be modularized for larger projects:

- Game state management using React hooks
- Daily word selection using date-based seeding
- Statistics and leaderboard persistence with localStorage
- Responsive UI components with accessibility in mind

## 🎨 Customization

You can customize the game by:

1. Modifying the word list array in the code
2. Adjusting the color scheme or animations
3. Changing the difficulty by modifying the maximum number of attempts
4. Adding additional features like hints or different game modes

## 📱 Mobile Support

The game is fully responsive and works well on mobile devices:
- Touch-friendly keyboard
- Properly sized game board for different screen sizes
- Optimized layout for portrait orientation

## 🔮 Future Enhancements

- Server-side leaderboard with user accounts
- Social sharing functionality
- Daily statistics and streaks visualization
- Multiple difficulty levels
- Custom word lists or themes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Inspired by [Wordle](https://www.nytimes.com/games/wordle/index.html)
- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)

---

Created with ❤️ by [Your Name]
