import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import "./App.css";
import Navbar from "./components/Navbar.tsx";
import {
  deleteGame,
  resumeLatestGame,
  saveGame,
  startNewGame,
} from "./memory.ts";
import History from "./pages/History.tsx";
import Home from "./pages/Home.tsx";
import Settings from "./pages/Settings.tsx";

const NEW_GAME_ROWS = 3;
const NEW_GAME_COLUMNS = 3;

function App() {
  // Kept here rather than in Home so that switching pages keeps the same puzzle.
  const [current, setCurrent] = useState(
    () => resumeLatestGame() ?? startNewGame(NEW_GAME_ROWS, NEW_GAME_COLUMNS),
  );

  // Saves automatically whenever the game record changes.
  useEffect(() => {
    if (!saveGame(current.game)) {
      console.warn("The sudoku could not be saved.");
    }
  }, [current.game]);

  function startOver() {
    deleteGame(current.game.id);
    setCurrent(startNewGame(NEW_GAME_ROWS, NEW_GAME_COLUMNS));
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={<Home sudoku={current.sudoku} onStartOver={startOver} />}
        />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
