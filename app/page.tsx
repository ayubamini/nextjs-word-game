"use client";

import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalStorage } from "react-use";
import {
  Moon,
  Sun,
  Trophy,
  Trash2 as Delete,
  User,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Roboto_Condensed, JetBrains_Mono } from "next/font/google";

const jetBrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

type GameState = "playing" | "won" | "lost";
type ThemeMode = "light" | "dark";
type LetterState = "correct" | "present" | "absent" | "empty";

interface GuessLetter {
  letter: string;
  state: LetterState;
}

interface PlayerScore {
  name: string;
  wins: number;
  streak: number;
  bestStreak: number;
  totalGames: number;
  avgGuesses: number;
}

const getRandomWord = (): string => {
  const today = new Date();
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  return words[seed % words.length].toUpperCase();
};

const getNewDay = (): number => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
};

const getTimeToNextWord = (): number => {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  return tomorrow.getTime() - now.getTime();
};

const words = [
  "APPLE",
  "BEACH",
  "CHART",
  "DROWN",
  "EAGLE",
  "FAULT",
  "GRANT",
  "HOTEL",
  "IVORY",
  "JOKER",
  "KNEEL",
  "LEMON",
  "MUSIC",
  "NOBLE",
  "OCEAN",
  "PIANO",
  "QUICK",
  "RADIO",
  "STORM",
  "TRUST",
  "UNITY",
  "VIVID",
  "WATER",
  "XENON",
  "YACHT",
  "ZEBRA",
  "BRAVE",
  "CRATE",
  "DRAFT",
  "EIGHT",
  "FLAME",
  "GHOST",
  "HOUSE",
  "ITCHY",
  "JUMBO",
  "KNIFE",
  "LIGHT",
  "MONTH",
  "NIGHT",
  "OVERT",
  "PLANK",
  "QUILT",
  "RIVAL",
  "SNAKE",
  "TRAIN",
  "UPSET",
  "VAULT",
  "WASTE",
  "YIELD",
  "ZESTY",
  "ACTOR",
  "BLUNT",
  "CLIMB",
  "DOUBT",
  "ENJOY",
  "FOUND",
  "GRAPE",
  "HAPPY",
  "IMAGE",
  "JUMPS",
  "KNOWN",
  "LOVED",
  "MINOR",
  "NEVER",
  "OWNER",
  "POWER",
  "QUEST",
  "RIDGE",
  "SMART",
  "TOUCH",
  "UNDER",
  "VIOLA",
  "WOMAN",
  "YOUTH",
  "ALARM",
  "BLEND",
  "CLEAN",
  "DREAM",
  "EVENT",
  "FIGHT",
  "GREEN",
  "HEART",
  "IDEAL",
  "JUICE",
  "KINDS",
  "LAUGH",
  "MAJOR",
  "NOVEL",
];

const WordPuzzle = () => {
  const WORD_LENGTH = 5;
  const MAX_ATTEMPTS = 6;

  const [theme, setTheme] = useLocalStorage<ThemeMode>("theme", "light");
  const [gameState, setGameState] = useState<GameState>("playing");
  const [secretWord, setSecretWord] = useState<string>("");
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [guesses, setGuesses] = useState<GuessLetter[][]>([]);
  const [previousGuesses, setPreviousGuesses] = useState<string[]>([]);
  const [timeToNextWord, setTimeToNextWord] = useState<number>(0);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [currentDay, setCurrentDay] = useLocalStorage<number>(
    "currentDay",
    getNewDay()
  );
  const [message, setMessage] = useState<string>("");
  const [shake, setShake] = useState<boolean>(false);
  const [keyboardStatus, setKeyboardStatus] = useState<
    Record<string, LetterState>
  >({});
  const [showStatsSection, setShowStatsSection] = useState<boolean>(false);
  const [showNameModal, setShowNameModal] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>("");

  const [playerName, setPlayerName] = useLocalStorage<string>("playerName", "");
  const [playerStats, setPlayerStats] = useLocalStorage<PlayerScore>(
    "playerStats",
    {
      name: "",
      wins: 0,
      streak: 0,
      bestStreak: 0,
      totalGames: 0,
      avgGuesses: 0,
    }
  );
  const [leaderboard, setLeaderboard] = useLocalStorage<PlayerScore[]>(
    "leaderboard",
    []
  );
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  useEffect(() => {
    const now = getNewDay();

    if (now !== currentDay) {
      const newWord = getRandomWord();
      setSecretWord(newWord);
      setCurrentDay(now);
      resetGame(false);
    } else if (!secretWord) {
      setSecretWord(getRandomWord());
    }

    const timerInterval = setInterval(() => {
      setTimeToNextWord(getTimeToNextWord());
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [currentDay, secretWord, setCurrentDay]);

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
      document.documentElement.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const resetGame = (keepStats: boolean = true) => {
    setGameState("playing");
    setCurrentGuess("");
    setGuesses([]);
    setPreviousGuesses([]);
    setKeyboardStatus({});
    setMessage("");

    if (!keepStats && playerStats) {
      setPlayerStats({
        name: playerStats.name,
        wins: playerStats.wins,
        streak: 0,
        bestStreak: playerStats.bestStreak,
        totalGames: playerStats.totalGames,
        avgGuesses: playerStats.avgGuesses,
      });
    }
  };

  const isValidGuess = (guess: string): boolean => {
    if (guess.length !== WORD_LENGTH) {
      setMessage("Word must be 5 letters long");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return false;
    }

    if (previousGuesses.includes(guess)) {
      setMessage("You already tried that word");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return false;
    }

    return true;
  };

  const processGuess = () => {
    if (!isValidGuess(currentGuess)) return;

    const newGuess: GuessLetter[] = Array.from({ length: WORD_LENGTH }).map(
      (_, i) => ({
        letter: currentGuess[i],
        state: "empty",
      })
    );

    let secretWordCopy = secretWord.split("");

    for (let i = 0; i < WORD_LENGTH; i++) {
      if (currentGuess[i] === secretWord[i]) {
        newGuess[i].state = "correct";
        secretWordCopy[i] = "*";
        setKeyboardStatus((prev) => ({
          ...prev,
          [currentGuess[i]]: "correct",
        }));
      }
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
      if (newGuess[i].state !== "correct") {
        const letterIndex = secretWordCopy.indexOf(currentGuess[i]);
        if (letterIndex !== -1) {
          newGuess[i].state = "present";
          secretWordCopy[letterIndex] = "*";
          if (keyboardStatus[currentGuess[i]] !== "correct") {
            setKeyboardStatus((prev) => ({
              ...prev,
              [currentGuess[i]]: "present",
            }));
          }
        } else {
          newGuess[i].state = "absent";
          if (!keyboardStatus[currentGuess[i]]) {
            setKeyboardStatus((prev) => ({
              ...prev,
              [currentGuess[i]]: "absent",
            }));
          }
        }
      }
    }

    setGuesses((prev) => [...prev, newGuess]);
    setPreviousGuesses((prev) => [...prev, currentGuess]);
    setCurrentGuess("");

    if (currentGuess === secretWord) {
      setGameState("won");
      setMessage("Congratulations! You got it!");
      updatePlayerStats(true, guesses.length + 1);
    } else if (guesses.length + 1 >= MAX_ATTEMPTS) {
      setGameState("lost");
      setMessage(`Game over! The word was ${secretWord}`);
      updatePlayerStats(false, MAX_ATTEMPTS);
    }
  };

  const updatePlayerStats = (won: boolean, numGuesses: number) => {
    if (!playerName || !playerStats) return;

    const newStats: PlayerScore = {
      name: playerStats.name,
      totalGames: playerStats.totalGames + 1,
      wins: won ? playerStats.wins + 1 : playerStats.wins,
      streak: won ? playerStats.streak + 1 : 0,
      bestStreak: won
        ? Math.max(playerStats.bestStreak, playerStats.streak + 1)
        : playerStats.bestStreak,
      avgGuesses: won
        ? (playerStats.avgGuesses * playerStats.wins + numGuesses) /
          (playerStats.wins + 1)
        : playerStats.avgGuesses,
    };

    setPlayerStats(newStats);

    if (leaderboard) {
      const existingPlayerIndex = leaderboard.findIndex(
        (p) => p.name === playerName
      );
      const newLeaderboard = [...leaderboard];

      if (existingPlayerIndex !== -1) {
        newLeaderboard[existingPlayerIndex] = newStats;
      } else {
        newLeaderboard.push(newStats);
      }

      newLeaderboard.sort((a, b) => {
        if (a.wins !== b.wins) return b.wins - a.wins;
        return a.avgGuesses - b.avgGuesses;
      });

      setLeaderboard(newLeaderboard);
    } else {
      setLeaderboard([newStats]);
    }
  };

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (gameState !== "playing") return;

      const key = event.key.toUpperCase();

      if (key === "ENTER") {
        processGuess();
      } else if (key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [currentGuess, gameState, processGuess]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const handleVirtualKeyPress = (key: string) => {
    if (gameState !== "playing") return;

    if (key === "ENTER") {
      processGuess();
    } else if (key === "BACKSPACE") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + key);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    if (newTheme === "dark") {
      document.body.classList.add("dark");
      document.documentElement.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
      document.documentElement.classList.remove("dark");
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const openNameModal = () => {
    setNameInput(playerName || "");
    setShowNameModal(true);
  };

  const handleNameSubmit = () => {
    if (nameInput.trim()) {
      setPlayerName(nameInput.trim());
      if (playerStats) {
        setPlayerStats({
          ...playerStats,
          name: nameInput.trim(),
        });
      } else {
        setPlayerStats({
          name: nameInput.trim(),
          wins: 0,
          streak: 0,
          bestStreak: 0,
          totalGames: 0,
          avgGuesses: 0,
        });
      }
      setShowNameModal(false);
    }
  };

  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
  ];

  return (
    <div
      className={`${robotoCondensed.className} min-h-screen flex flex-col transition-colors duration-300 ease-in-out ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}
    >
      <Head>
        <title>Word Puzzle Challenge</title>
        <meta name="description" content="A fun daily word puzzle game" />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Permanent+Marker&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <style jsx global>{`
          button,
          [role="button"],
          a {
            cursor: pointer !important;
          }
        `}</style>
      </Head>

      <header className="py-4 px-6 flex justify-between items-center border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <motion.h1
            className={`${jetBrains.className} text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400}`}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Word Puzzle
          </motion.h1>
          <motion.div
            className="text-md font-medium border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            Next word in: {formatTime(timeToNextWord)}
          </motion.div>
        </div>

        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200  cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200  cursor-pointer"
            aria-label="Show leaderboard"
          >
            <Trophy size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowStatsSection(!showStatsSection)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer"
            aria-label="Toggle stats"
          >
            {showStatsSection ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </motion.button>

          {!playerName ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openNameModal}
              className="py-1 px-3 rounded-lg flex items-center space-x-2 bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors  cursor-pointer"
            >
              <User size={16} />
              <span>Set Name</span>
            </motion.button>
          ) : (
            <div className="flex items-center space-x-2 text-sm font-medium">
              <User size={16} />
              <span>{playerName}</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 overflow-x-hidden">
        <AnimatePresence>
          {showStatsSection && playerStats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl mb-6 overflow-hidden"
            >
              <div
                className={`p-4 rounded-lg ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                } shadow-md`}
              >
                <h2 className="text-xl font-bold mb-3 text-amber-600 dark:text-amber-400">
                  Your Stats
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900 dark:bg-opacity-30">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Win Rate
                    </div>
                    <div className="text-2xl font-bold">
                      {playerStats.totalGames > 0
                        ? `${Math.round((playerStats.wins / playerStats.totalGames) * 100)}%`
                        : "0%"}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900 dark:bg-opacity-30">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Current Streak
                    </div>
                    <div className="text-2xl font-bold">
                      {playerStats.streak}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Best Streak
                    </div>
                    <div className="text-2xl font-bold">
                      {playerStats.bestStreak}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900 dark:bg-opacity-30">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Avg Guesses
                    </div>
                    <div className="text-2xl font-bold">
                      {playerStats.wins > 0
                        ? playerStats.avgGuesses.toFixed(1)
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className={`mb-6 py-2 px-4 rounded-lg font-medium ${
                gameState === "won"
                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                  : gameState === "lost"
                    ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
              }`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-lg mx-auto flex flex-col items-center">
          <motion.div
            className={`grid gap-2 mb-8 mx-auto ${shake ? "animate-shake" : ""}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {guesses.map((guess, rowIndex) => (
              <div key={`row-${rowIndex}`} className="grid grid-cols-5 gap-2">
                {guess.map((letter, colIndex) => (
                  <motion.div
                    key={`cell-${rowIndex}-${colIndex}`}
                    initial={{ rotateX: -90 }}
                    animate={{ rotateX: 0 }}
                    transition={{ duration: 0.3, delay: colIndex * 0.1 }}
                    className={`${robotoCondensed.className} w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl font-bold rounded-lg border-2 ${
                      letter.state === "correct"
                        ? "bg-green-500 text-white border-green-600"
                        : letter.state === "present"
                          ? "bg-yellow-500 text-white border-yellow-600"
                          : letter.state === "absent"
                            ? "bg-gray-500 text-white border-gray-600"
                            : theme === "dark"
                              ? "bg-gray-700 border-gray-600"
                              : "bg-white border-gray-300"
                    }`}
                  >
                    {letter.letter}
                  </motion.div>
                ))}
              </div>
            ))}

            {gameState === "playing" && (
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: WORD_LENGTH }).map((_, index) => (
                  <motion.div
                    key={`current-${index}`}
                    initial={{ scale: 0.8 }}
                    animate={{
                      scale: index < currentGuess.length ? [1, 1.1, 1] : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl font-bold rounded-lg border-2 ${robotoCondensed.className} ${
                      index < currentGuess.length
                        ? theme === "dark"
                          ? "bg-gray-700 border-amber-500"
                          : "bg-white border-amber-500"
                        : theme === "dark"
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-300"
                    }`}
                  >
                    {index < currentGuess.length ? currentGuess[index] : ""}
                  </motion.div>
                ))}
              </div>
            )}

            {gameState === "playing" &&
              Array.from({ length: MAX_ATTEMPTS - guesses.length - 1 }).map(
                (_, rowIndex) => (
                  <div
                    key={`empty-row-${rowIndex}`}
                    className="grid grid-cols-5 gap-2"
                  >
                    {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => (
                      <div
                        key={`empty-${rowIndex}-${colIndex}`}
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-lg border-2 ${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-700"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                )
              )}
          </motion.div>

          {showKeyboard && (
            <motion.div
              className="w-full max-w-lg mx-auto mt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {keyboardRows.map((row, rowIndex) => (
                <div
                  key={`kb-row-${rowIndex}`}
                  className="flex justify-center mb-2"
                >
                  {row.map((key) => (
                    <motion.button
                      key={`key-${key}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleVirtualKeyPress(key)}
                      className={`mx-1 py-3 rounded-lg text-lg font-medium cursor-pointer ${
                        key === "ENTER" || key === "BACKSPACE"
                          ? "px-3 md:px-4 flex items-center justify-center"
                          : "w-10 md:w-12"
                      } ${
                        key !== "ENTER" &&
                        key !== "BACKSPACE" &&
                        keyboardStatus[key]
                          ? keyboardStatus[key] === "correct"
                            ? "bg-green-500 text-white"
                            : keyboardStatus[key] === "present"
                              ? "bg-yellow-500 text-white"
                              : keyboardStatus[key] === "absent"
                                ? theme === "dark"
                                  ? "bg-gray-800 text-gray-400"
                                  : "bg-gray-300 text-gray-500"
                                : theme === "dark"
                                  ? "bg-gray-700 text-white"
                                  : "bg-gray-200 text-gray-700"
                          : theme === "dark"
                            ? "bg-gray-700 text-white"
                            : "bg-gray-200 text-gray-700"
                      }`}
                      disabled={gameState !== "playing"}
                    >
                      {key === "BACKSPACE" ? <Delete size={18} /> : key}
                    </motion.button>
                  ))}
                </div>
              ))}
            </motion.div>
          )}

          {gameState !== "playing" && (
            <motion.div
              className="mt-6 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => resetGame()}
                className="py-2 px-6 rounded-lg bg-amber-600 cursor-pointer text-white font-medium shadow-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
              >
                <RotateCcw size={18} />
                <span>Play Again</span>
              </motion.button>
            </motion.div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showNameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowNameModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-md rounded-xl p-6 ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  Player Name
                </h2>
                <button
                  onClick={() => setShowNameModal(false)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="name-input"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Enter your name:
                </label>
                <input
                  id="name-input"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  placeholder="Your name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNameSubmit();
                  }}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowNameModal(false)}
                  className={`py-2 px-4 rounded-lg font-medium  cursor-pointer ${
                    theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNameSubmit}
                  className="py-2 px-4 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700  cursor-pointer"
                >
                  Save
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <footer className="py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-300 dark:border-gray-700">
        <p className={`${robotoCondensed.className}`}>
          © 2025{" "}
          <span
            className={`${jetBrains.className} text-amber-600 dark:text-amber-400`}
          >
            Word Puzzle
          </span>
          . New challenge every day!
        </p>
      </footer>
    </div>
  );
};

export default WordPuzzle;
