class Game {
    constructor(boardSideSize, cellSize) {
        this.boardSideSize = boardSideSize
        this.cellSize = cellSize
        this.mode = 'inspect'
        this.state = 'playing'
        this.playerBoard = {
            parent: document.getElementById('player_board'),
            cells: {}
        }
        this.computerBoard = {
            parent: document.getElementById('computer_board'),
            cells: {}
        }
    }
    initBoard(whichBoard) {
        console.log(`running initBoard`)
        for (let i = 0; i < this.boardSideSize * this.boardSideSize; i++) {
            this[whichBoard].cells[i] = {
                id: i,
                contains: 'water',
                isHidden: true,
                identify: () => {
                    console.log(`I am cell ${this[whichBoard].cells[i].id}, I contain ${this[whichBoard].cells[i].contains}, and my isHidden is ${this[whichBoard].cells[i].isHidden}`)
                },
                reveal: () => {
                    console.log(`revealing`)
                    this[whichBoard].cells[i].isHidden = false
                    this.renderBoardCells(whichBoard)
                }
            }  
        }
    }
    renderBoardCells(whichBoard) {
        this[whichBoard].parent.innerHTML = ''
        this[whichBoard].parent.style.width = `${this.boardSideSize * (this.cellSize + 2)}px`
        this[whichBoard].parent.style.display = "flex"
        this[whichBoard].parent.style.flexWrap = "wrap"
        for (let cell in this[whichBoard].cells) {
            this.renderBoardCell(whichBoard, this[whichBoard].parent, this[whichBoard].cells[cell].id)
        }
    }
    renderBoardCell(whichBoard, parent, id, style = "1px solid black") {
        const cell = document.createElement("div")
        switch (this[whichBoard].cells[id].contains) {
            case 'ship':
                cell.style.backgroundColor = 'black'
                break;
            case 'water':
                cell.style.backgroundColor = '#4d5df0'
            default:
                break;
        }
        if (this[whichBoard].cells[id].isHidden) {
            cell.style.backgroundColor = 'white'
        }
        cell.style.height = `${this.cellSize}px`
        cell.style.width = `${this.cellSize}px`
        cell.style.border = style
        cell.id = id
        switch (this.mode) {
            case 'inspect':
                cell.addEventListener("click", this[whichBoard].cells[id].identify)
                break
            case 'reveal':
                cell.addEventListener("click", this[whichBoard].cells[id].reveal)
                break
            default:
                break;
        }
        parent.append(cell)
    }
    renderControlButtons(){
        parent = document.getElementById('control_buttons')
        let newButton = document.createElement('button')
        newButton.innerHTML = `<h4>Reveal</h4>`
        newButton.addEventListener('click', () => {
            this.mode = 'reveal'
            console.log(`Game mode set to ${this.mode}`)
            this.renderBoardCells('playerBoard')
        })
        parent.appendChild(newButton)

        newButton = document.createElement('button')
        newButton.innerHTML = `<h4>Inspect</h4>`
        newButton.addEventListener('click', () => {
            this.mode = 'inspect'
            console.log(`Game mode set to ${this.mode}`)
            this.renderBoardCells('playerBoard')
        })
        parent.appendChild(newButton)
    }
    addShip(whichBoard, startingCellID, size, downOrRight){
        let currentCellID = startingCellID
        for (let i = 0; i < size; i++) {
            this[whichBoard].cells[currentCellID].contains = 'ship'
            if (downOrRight === 'down') {
                currentCellID += 10
            } else if (downOrRight === 'right') {
                currentCellID += 1
            }
        }
    }
}

const game = new Game(10, 40)
game.renderControlButtons()
game.initBoard('playerBoard')
game.renderBoardCells('playerBoard')
game.addShip('playerBoard', 0, 3, 'down')
game.addShip('playerBoard', 1, 3, 'right')