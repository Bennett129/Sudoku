// import { useState } from "react";
// import heroImg from "./assets/hero.png";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "./assets/vite.svg";
import "./App.css";
import "./sudoku.ts";
import { Sudoku, Cell } from "./sudoku.ts";
function App() {
  // const [count, setCount] = useState(0);

  return (
    <>
      <section className="container">
        <Table numColumns={9} numRows={9} />
        {}
      </section>
    </>
  );
}
//
// function createEmptyGrid({
//   numRows,
//   numColumns,
// }: {
//   numRows: number;
//   numColumns: number;
// }) {
//   const initialGrid: number[][] = [[]];
//   for (let i = 0; i < numRows; i++) {
//     initialGrid[i] = [];
//     for (let j = 0; j < numColumns; j++) {
//       initialGrid[i][j] = 0;
//     }
//   }
//   return initialGrid;
// }

function createInitialSudoku({
  numRows,
  numColumns,
}: {
  numRows: number;
  numColumns: number;
}) {
  const initialSudoku: number[][] = [[]];
  for (let i = 0; i < numRows; i++) {
    initialSudoku[i] = [];
    for (let j = 0; j < numColumns; j++) {
      initialSudoku[i][j] = j + 1;
    }
  }
  return initialSudoku;
}
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
  if (row == 0 || row == 3 || row == 6) {
    classes += "border_top ";
  }
  if (row == 2 || row == 5 || row == 8) {
    classes += "border_bottom ";
  }

  if (column == 0 || column == 3 || column == 6) {
    classes += "border_left ";
  }
  if (column == 2 || column == 5 || column == 8) {
    classes += "border_right ";
  }

  // if (row % numRows != 0 && column % numColumns != 0) {
  //   return (
  //     <div key={key} className="cell">
  //       {children}
  //     </div>
  //   );
  // }
  return <div className={`cell ${classes}`}>{children}</div>;
}

// function Table({
//   numRows,
//   numColumns,
// }: {
//   numRows: number;
//   numColumns: number;
// }) {
//   // const [sudoku, setSudoku] = useState<number[][]>(() =>
//   //   createInitialSudoku({ numRows, numColumns }),
//   // );
//   const sudoku = new Sudoku(3, 3);
//
//   return (
//     <div>
//       <div>
//         {sudoku.map((row, i) => (
//           <div key={i} id={"row" + i} className={"row"}>
//             {row.map((value, j) => (
//               <Cell
//                 numColumns={numColumns}
//                 numRows={numRows}
//                 row={i}
//                 column={j}
//                 key={String((i - 1) * numColumns + (j - 1))}
//               >
//                 {String(value)}
//               </Cell>
//             ))}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
function Table({
  numRows,
  numColumns,
}: {
  numRows: number;
  numColumns: number;
}) {
  // const [sudoku, setSudoku] = useState<number[][]>(() =>
  //   createInitialSudoku({ numRows, numColumns }),
  // );
  const sudoku = new Sudoku(3, 3);

  return (
    <div className="sudoku">
      {sudoku.solutionGrid.map((row, i) => (
        <div key={i} id={"row" + i} className={"row"}>
          {row.map((value, j) => (
            <DisplayCell
              numColumns={numColumns}
              numRows={numRows}
              row={i}
              column={j}
              key={String((i - 1) * numColumns + (j - 1))}
            >
              {String(sudoku.solutionGrid[i][j].value)}
            </DisplayCell>
          ))}
        </div>
      ))}
    </div>
  );
}
{
  /* <div key={j} className="cell"> */
}
{
  /*   {value} */
}
{
  /* </div> */
}
export default App;
