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
];

export class Sudoku {
  //userGrid: string[][];
  solutionGrid: Cell[][];

  rows: number;
  columns: number;
  rowWidth: number;
  columnWidth: number;
  length: number;
  constructor(rows: number, columns: number) {
    this.rows = rows;
    this.columns = columns;
    this.length = this.rows * this.columns;
    this.rowWidth = this.length / this.rows;
    this.columnWidth = this.length / this.columns;
    this.solutionGrid = [[]];
    for (let i = 0; i < this.length; i++) {
      this.solutionGrid[i] = [];
      for (let j = 0; j < this.length; j++) {
        this.solutionGrid[i][j] = new Cell(this.length);
        this.solutionGrid[i][j].setValue("" + (j + 1));
      }
    }
    this.addRandomCharacter();
    // some method
    //this.userGrid = this.solutionGrid.slice().map(row);
  }
  private getRandomRow(): number {
    return Math.floor(Math.random() * this.rows);
  }
  private getRandomColumn(): number {
    return Math.floor(Math.random() * this.columns);
  }
  private getRandomChar(): number {
    return Math.floor(Math.random() * this.length);
  }
  public addRandomCharacter() {
    let randomRow: number;
    let randomColumn: number;
    let randomChar: number;

    // do {
    randomRow = this.getRandomColumn();
    randomColumn = this.getRandomRow();
    randomChar = this.getRandomChar();
    this.solutionGrid[randomRow][randomColumn].setValue(randomChar);
    // } while (this.attemptPlacement(randomRow, randomColumn, randomChar));
  }
  public attemptPlacement(
    row: number,
    column: number,
    charIndex: number,
  ): boolean {
    if (!this.checkRow(row, charIndex)) {
      return false;
    }
    if (!this.checkColumn(column, charIndex)) {
      return false;
    }
    if (!this.checkBlock(row, column, charIndex)) {
      return false;
    }
    this.solutionGrid[row][column].setValue(possibleValues[charIndex]);
    return true;
  }

  private checkRow(row: number, charIndex: number): boolean {
    for (let i = 0; i < this.length; i++) {
      if (this.solutionGrid[row][i].value == possibleValues[charIndex]) {
        return false;
      }
    }
    return true;
  }
  private checkColumn(column: number, charIndex: number): boolean {
    for (let i = 0; i < this.length; i++) {
      if (this.solutionGrid[i][column].value == possibleValues[charIndex]) {
        return false;
      }
    }
    return true;
  }
  private checkBlock(row: number, column: number, charIndex: number): boolean {
    const startingX: number = row - (row % this.rowWidth);
    const startingY: number = column - (column % this.columnWidth);
    for (let i = 0; i < this.columnWidth; i++) {
      for (let j = 0; j < this.rowWidth; j++) {
        if (
          this.solutionGrid[i + startingX][j + startingY].value ==
          possibleValues[charIndex]
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

  constructor(length: number) {
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

  setValue(value: string | number): void {
    if (typeof value === "string") {
      this.possibilities = [value];
      this.length = 1;
      this.value = value;
    }
    (value as number)--;
    this.possibilities = [possibleValues[value as number]];
    this.length = 1;
    this.value = possibleValues[value as number];
  }

  //removePossibility(value: string): boolean {}
}
