const playerBoard = document.getElementById('player_board')
const computerBoard = document.getElementById('computer_board')

function renderBoardCells(boardSideSize, cellSize, parent) {
    parent.style.width = `${(boardSideSize * (cellSize + 2))}px`
    parent.style.display = "flex"
    parent.style.flexWrap = "wrap"
    for (let i = 0; i < boardSideSize * boardSideSize; i++) {
        renderBoardCell(cellSize, parent, i)
    }
}

function renderBoardCell(size, parent, id, style = "1px solid black") {
    const cell = document.createElement("div")
    cell.style.height = `${size}px`
    cell.style.width = `${size}px`
    cell.style.border = style
    cell.id = id
    cell.addEventListener("click", () => {
        console.log(`Hello, my id is ${cell.id}`)
    })
    parent.append(cell)
}

renderBoardCells(10, 20, playerBoard)