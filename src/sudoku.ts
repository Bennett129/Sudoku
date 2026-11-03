import type { SavedGame } from "./memory.ts";

const BLANK = ".";

const possibleValues: string[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
];

function shuffledIndexes(length: number): number[] {
  const indexes: number[] = [];
  for (let i = 0; i < length; i++) {
    indexes[i] = i;
  }
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }
  return indexes;
}

type CellCandidates = {
  row: number;
  column: number;
  candidates: number[];
};

// Grids as text have one character per cell, row by row, with "." for blanks.
export function gridToText(grid: Cell[][]): string {
  return grid
    .map((row) => row.map((cell) => cell.value || BLANK).join(""))
    .join("");
}

export function textToGrid(text: string, length: number): Cell[][] {
  const grid: Cell[][] = [];
  for (let row = 0; row < length; row++) {
    grid[row] = [];
    for (let column = 0; column < length; column++) {
      const cell = new Cell(length);
      const value = text[row * length + column];
      if (value !== BLANK) {
        cell.setValue(value);
      }
      grid[row][column] = cell;
    }
  }
  return grid;
}

export class Sudoku {
  clueGrid: Cell[][]; // the puzzle as it started
  userGrid: Cell[][]; // the puzzle as far as the player has completed it
  solutionGrid: Cell[][];

  rows: number;
  columns: number;
  rowWidth: number;
  columnWidth: number;
  length: number;
  // Creates a blank board with no puzzle. Use Sudoku.generate for a new puzzle
  // or Sudoku.fromSaved to resume one.
  constructor(rows: number, columns: number) {
    this.rows = rows;
    this.columns = columns;
    this.length = this.rows * this.columns;
    this.rowWidth = this.length / this.rows;
    this.columnWidth = this.length / this.columns;
    this.clueGrid = this.createEmptyGrid();
    this.userGrid = this.createEmptyGrid();
    this.solutionGrid = this.createEmptyGrid();
  }
  // Creates a new random puzzle that has exactly one solution.
  public static generate(rows: number, columns: number): Sudoku {
    const sudoku = new Sudoku(rows, columns);
    sudoku.solutionGrid = sudoku.solve(sudoku.createEmptyGrid());
    sudoku.userGrid = sudoku.copyGrid(sudoku.solutionGrid);
    sudoku.removeClues();
    sudoku.clueGrid = sudoku.copyGrid(sudoku.userGrid);
    return sudoku;
  }
  // Resumes a saved game. The solution comes from the clues, because the
  // player's entries may be wrong. Throws if the saved clues can't be solved.
  public static fromSaved(game: SavedGame): Sudoku {
    const sudoku = new Sudoku(game.rows, game.columns);
    sudoku.clueGrid = textToGrid(game.clues, sudoku.length);
    sudoku.userGrid = textToGrid(game.progress, sudoku.length);
    sudoku.solutionGrid = sudoku.solve(sudoku.clueGrid);
    return sudoku;
  }
  // Solves a puzzle by guessing values and backing up when a guess fails, and
  // returns the solution as a new grid. The puzzle itself isn't changed. Throws
  // if the puzzle is invalid or has no solution. Guesses are made in random
  // order, so a puzzle with several solutions can return any of them.
  public solve(puzzle: Cell[][]): Cell[][] {
    if (!this.isValidPuzzle(puzzle)) {
      throw new Error("Invalid sudoku: the grid or its clues break the rules.");
    }
    const solution: Cell[][] = this.copyGrid(puzzle);
    if (!this.guessRemainingCells(solution)) {
      throw new Error("Unsolvable sudoku: no solution exists for these clues.");
    }
    return solution;
  }
  // Fills every empty cell, returning false if no combination of guesses works.
  // A failed attempt leaves the grid as it was found.
  private guessRemainingCells(grid: Cell[][]): boolean {
    const next = this.findMostConstrainedCell(grid);
    if (next === null) {
      return true;
    }
    const cell: Cell = grid[next.row][next.column];
    for (const i of shuffledIndexes(next.candidates.length)) {
      cell.setValue(possibleValues[next.candidates[i]]);
      if (this.guessRemainingCells(grid)) {
        return true;
      }
    }
    cell.clear();
    return false;
  }
  // Finds the empty cell with the fewest legal values, which keeps the number
  // of guesses small. Returns null when the grid has no empty cells.
  private findMostConstrainedCell(grid: Cell[][]): CellCandidates | null {
    let best: CellCandidates | null = null;
    for (let row = 0; row < this.length; row++) {
      for (let column = 0; column < this.length; column++) {
        if (grid[row][column].value !== "") {
          continue;
        }
        const candidates: number[] = this.getCandidates(grid, row, column);
        if (candidates.length === 0) {
          return { row, column, candidates };
        }
        if (best === null || candidates.length < best.candidates.length) {
          best = { row, column, candidates };
        }
      }
    }
    return best;
  }
  private getCandidates(
    grid: Cell[][],
    row: number,
    column: number,
  ): number[] {
    const candidates: number[] = [];
    for (let charIndex = 0; charIndex < this.length; charIndex++) {
      if (this.canPlace(grid, row, column, charIndex)) {
        candidates.push(charIndex);
      }
    }
    return candidates;
  }
  // Checks the grid is the right size, and that every clue is a value this size
  // of grid allows and doesn't clash with another clue.
  private isValidPuzzle(puzzle: Cell[][]): boolean {
    if (
      puzzle.length !== this.length ||
      puzzle.some((row) => row.length !== this.length)
    ) {
      return false;
    }
    const grid: Cell[][] = this.copyGrid(puzzle);
    for (let row = 0; row < this.length; row++) {
      for (let column = 0; column < this.length; column++) {
        const cell: Cell = grid[row][column];
        const value: string = cell.value;
        if (value === "") {
          continue;
        }
        const charIndex: number = possibleValues.indexOf(value);
        if (charIndex === -1 || charIndex >= this.length) {
          return false;
        }
        // Taken out first, so the clue isn't compared against itself.
        cell.clear();
        const isAllowed: boolean = this.canPlace(grid, row, column, charIndex);
        cell.setValue(value);
        if (!isAllowed) {
          return false;
        }
      }
    }
    return true;
  }
  private createEmptyGrid(): Cell[][] {
    const grid: Cell[][] = [];
    for (let row = 0; row < this.length; row++) {
      grid[row] = [];
      for (let column = 0; column < this.length; column++) {
        grid[row][column] = new Cell(this.length);
      }
    }
    return grid;
  }
  private copyGrid(grid: Cell[][]): Cell[][] {
    return grid.map((row) =>
      row.map((original) => {
        const cell = new Cell(this.length);
        if (original.value !== "") {
          cell.setValue(original.value);
        }
        return cell;
      }),
    );
  }
  // Visits every cell in random order and empties it, unless that would give
  // the puzzle more than one solution.
  private removeClues(): void {
    for (const position of shuffledIndexes(this.length * this.length)) {
      const cell =
        this.userGrid[Math.floor(position / this.length)][
          position % this.length
        ];
      const value: string = cell.value;
      cell.clear();
      if (this.countSolutions(this.userGrid, 2) !== 1) {
        cell.setValue(value);
      }
    }
  }
  // Counts the solutions of a grid, stopping once it reaches the limit. The
  // grid is left as it was found.
  private countSolutions(grid: Cell[][], limit: number): number {
    const next = this.findMostConstrainedCell(grid);
    if (next === null) {
      return 1;
    }
    const cell: Cell = grid[next.row][next.column];
    let count: number = 0;
    for (const charIndex of next.candidates) {
      cell.setValue(possibleValues[charIndex]);
      count += this.countSolutions(grid, limit - count);
      cell.clear();
      if (count >= limit) {
        break;
      }
    }
    return count;
  }

  private canPlace(
    grid: Cell[][],
    row: number,
    column: number,
    charIndex: number,
  ): boolean {
    return (
      this.checkRow(grid, row, charIndex) &&
      this.checkColumn(grid, column, charIndex) &&
      this.checkBlock(grid, row, column, charIndex)
    );
  }
  private checkRow(grid: Cell[][], row: number, charIndex: number): boolean {
    for (let i = 0; i < this.length; i++) {
      if (grid[row][i].value == possibleValues[charIndex]) {
        return false;
      }
    }
    return true;
  }
  private checkColumn(
    grid: Cell[][],
    column: number,
    charIndex: number,
  ): boolean {
    for (let i = 0; i < this.length; i++) {
      if (grid[i][column].value == possibleValues[charIndex]) {
        return false;
      }
    }
    return true;
  }
  private checkBlock(
    grid: Cell[][],
    row: number,
    column: number,
    charIndex: number,
  ): boolean {
    const startingX: number = row - (row % this.columnWidth);
    const startingY: number = column - (column % this.rowWidth);
    for (let i = 0; i < this.columnWidth; i++) {
      for (let j = 0; j < this.rowWidth; j++) {
        if (
          grid[i + startingX][j + startingY].value == possibleValues[charIndex]
        ) {
          return false;
        }
      }
    }
    return true;
  }
}

export class Cell {
  possibilities: string[];
  length: number;
  value: string = "";
  private gridLength: number;

  constructor(length: number) {
    this.gridLength = length;
    this.length = length;
    this.possibilities = [];
    for (let i = 0; i < this.length; i++) {
      this.possibilities[i] = possibleValues[i];
    }
  }

  isPossible(value: string): boolean {
    for (let i = 0; i < this.length; i++) {
      if (this.possibilities[i] == value) {
        return true;
      }
    }
    return false;
  }

  private getPossibilityIndex(value: string): number {
    for (let i = 0; i < this.length; i++) {
      if (this.possibilities[i] == value) {
        return i;
      }
    }
    return -1;
  }

  removePossibility(value: string): void {
    const index: number = this.getPossibilityIndex(value);
    if (index != -1) {
      this.possibilities.splice(0, index);
      this.length--;
    }
  }

  setValue(value: string): void {
    this.possibilities = [value];
    this.length = 1;
    this.value = value;
  }

  clear(): void {
    this.possibilities = possibleValues.slice(0, this.gridLength);
    this.length = this.gridLength;
    this.value = "";
  }

  //removePossibility(value: string): boolean {}
}
