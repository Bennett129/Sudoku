import type { CSSProperties } from "react";
import type { Sudoku } from "../sudoku.ts";

function DisplayCell({
  row = 0,
  column = 0,
  numRows = 0,
  numColumns = 0,
  children,
}: {
  row?: number;
  column?: number;
  numRows?: number;
  numColumns?: number;
  children: string;
}) {
  let classes: string = "";
  // Blocks are numRows cells tall and numColumns cells wide.
  if (row % numRows == 0) {
    classes += "border_top ";
  }
  if (row % numRows == numRows - 1) {
    classes += "border_bottom ";
  }

  if (column % numColumns == 0) {
    classes += "border_left ";
  }
  if (column % numColumns == numColumns - 1) {
    classes += "border_right ";
  }

  return <div className={`cell ${classes}`}>{children}</div>;
}

function Table({ sudoku }: { sudoku: Sudoku }) {
  return (
    <div
      className="sudoku"
      style={{ "--grid-size": sudoku.length } as CSSProperties}
    >
      {sudoku.userGrid.map((row, i) => (
        <div key={i} id={"row" + i} className={"row"}>
          {row.map((cell, j) => (
            <DisplayCell
              numColumns={sudoku.columns}
              numRows={sudoku.rows}
              row={i}
              column={j}
              key={String((i - 1) * sudoku.columns + (j - 1))}
            >
              {cell.value}
            </DisplayCell>
          ))}
        </div>
      ))}
    </div>
  );
}

function Home({
  sudoku,
  onStartOver,
}: {
  sudoku: Sudoku;
  onStartOver: () => void;
}) {
  return (
    <section className="container">
      <Table sudoku={sudoku} />
      {/* Temporary: deletes the saved sudoku and starts a new one. */}
      <button type="button" onClick={onStartOver}>
        Start over
      </button>
    </section>
  );
}

export default Home;
