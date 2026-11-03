import { gridToText, Sudoku } from "./sudoku.ts";

const STORAGE_KEY = "sudoku.games";
const STORAGE_VERSION = 1;

export type SavedGame = {
  id: string;
  // Block dimensions, as passed to new Sudoku(rows, columns).
  rows: number;
  columns: number;
  // Grids are stored as one character per cell, row by row, with "." for blanks.
  clues: string; // the puzzle as it started, which tells clues from player entries
  progress: string; // the puzzle as far as the player has completed it
  // Only cells with notes are stored. See getCellNotes and setCellNotes.
  notes: Record<string, string>;
  date: string; // ISO 8601 time of the last save
  seconds: number;
};

// The puzzle being played, along with the record that gets saved for it.
export type CurrentGame = {
  sudoku: Sudoku;
  game: SavedGame;
};

// Neither function below saves anything, so they're safe to call during a
// React render. The caller saves the game with saveGame.
export function startNewGame(rows: number, columns: number): CurrentGame {
  const sudoku = Sudoku.generate(rows, columns);
  return { sudoku, game: createSavedGame(sudoku) };
}

// Returns null if there's no saved game, or if the latest one can't be solved.
export function resumeLatestGame(): CurrentGame | null {
  const game = loadLatestGame();
  if (game === null) {
    return null;
  }
  try {
    return { sudoku: Sudoku.fromSaved(game), game };
  } catch {
    return null;
  }
}

export function createSavedGame(sudoku: Sudoku): SavedGame {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    rows: sudoku.rows,
    columns: sudoku.columns,
    clues: gridToText(sudoku.clueGrid),
    progress: gridToText(sudoku.userGrid),
    notes: {},
    date: new Date().toISOString(),
    seconds: 0,
  };
}

export function getCellNotes(
  game: SavedGame,
  row: number,
  column: number,
): string {
  return game.notes[`${row},${column}`] ?? "";
}

// Returns a new game rather than changing this one, so it can go straight into
// React state. Pass an empty string to remove a cell's notes.
export function setCellNotes(
  game: SavedGame,
  row: number,
  column: number,
  notes: string,
): SavedGame {
  const updated = { ...game.notes };
  if (notes === "") {
    delete updated[`${row},${column}`];
  } else {
    updated[`${row},${column}`] = notes;
  }
  return { ...game, notes: updated };
}

// Saves a new game or replaces the one with the same id, and sets its date to
// now. Returns false if the browser refused, such as when storage is full.
export function saveGame(game: SavedGame): boolean {
  const others = loadGames().filter((saved) => saved.id !== game.id);
  return writeGames([...others, { ...game, date: new Date().toISOString() }]);
}

// All saved games, most recently saved first.
export function loadGames(): SavedGame[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      return [];
    }
    const data: unknown = JSON.parse(stored);
    if (
      !isRecord(data) ||
      data.version !== STORAGE_VERSION ||
      !Array.isArray(data.games)
    ) {
      return [];
    }
    return data.games
      .filter(isSavedGame)
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

export function loadGame(id: string): SavedGame | null {
  return loadGames().find((game) => game.id === id) ?? null;
}

export function loadLatestGame(): SavedGame | null {
  return loadGames()[0] ?? null;
}

export function deleteGame(id: string): boolean {
  return writeGames(loadGames().filter((game) => game.id !== id));
}

function writeGames(games: SavedGame[]): boolean {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, games }),
    );
    return true;
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSavedGame(value: unknown): value is SavedGame {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.rows !== "number" ||
    typeof value.columns !== "number" ||
    typeof value.clues !== "string" ||
    typeof value.progress !== "string" ||
    typeof value.date !== "string" ||
    typeof value.seconds !== "number" ||
    !isRecord(value.notes)
  ) {
    return false;
  }
  const cellCount = (value.rows * value.columns) ** 2;
  return (
    value.clues.length === cellCount &&
    value.progress.length === cellCount &&
    Object.values(value.notes).every((notes) => typeof notes === "string")
  );
}
