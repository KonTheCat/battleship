class Game {
    constructor(boardSideSize, cellSize) {
        this.boardSideSize = boardSideSize
        this.cellSize = cellSize
        this.mode = 'inspect'
        this.state = 'playing'
        this.playerBoard = {
            parent: document.getElementById('player_board'),
            cells: {},
            ships: {}
        }
        this.computerBoard = {
            parent: document.getElementById('computer_board'),
            cells: {},
            ships: {}
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
    initShips(whichBoard){
        console.log(`running initShips`)
        const ships = {
            destroyer: {size: 2, grids: [], status: 'init'},
            submarine: {size: 3, grids: [], status: 'init'},
            cruiser: {size: 3, grids: [], status: 'init'},
            battleship: {size: 4, grids: [], status: 'init'},
            carrier: {size: 5, grids: [], status: 'init'},
        }
        for (let ship in ships) {
            let initedShip = ships[ship]
            for (let i = 0; i < initedShip.size; i++) {
                initedShip.grids[i] = {id: -1, status: 'init'}
            } 
            this[whichBoard].ships[ship] = initedShip
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
    addShip(whichBoard, startingCellID, type, downOrRight){
        const size = this[whichBoard].ships[type].size
        if (this.validateAddShip(whichBoard, startingCellID, size, downOrRight)) {
            let currentCellID = startingCellID
            let shipObjectCellIterator = 0
            for (let i = 0; i < size; i++) {
                this[whichBoard].cells[currentCellID].contains = 'ship'
                this[whichBoard].ships[type].grids[shipObjectCellIterator].id = currentCellID
                this[whichBoard].ships[type].grids[shipObjectCellIterator].status = 'placed'
                shipObjectCellIterator ++
                if (downOrRight === 'down') {
                    currentCellID += 10
                } else if (downOrRight === 'right') {
                    currentCellID += 1
                }
            }
            this[whichBoard].ships[type].status = 'placed'
        } else {
            console.log(`Adding ship failed.`)
        }
    }
    validateAddShip(whichBoard, startingCellID, size, downOrRight) {
        let currentCellID = startingCellID
        for (let i = 0; i < size; i++) {
            if (this.validateCellForShipPlacement(whichBoard, currentCellID)) {
                if (downOrRight === 'down') {
                    currentCellID += 10
                } else if (downOrRight === 'right') {
                    currentCellID += 1
                }
            } else {
                throw new Error(`Illegal ship placement, a cell is occupied. The placement attempt was for board ${whichBoard}, starting cell ${startingCellID}, size ${size}, downOrRight ${downOrRight}, and the erroring cell was ${currentCellID}.`)
                return false
            }
        }
        return true
    }
    validateCellForShipPlacement(whichBoard, cellID) {
        if (this[whichBoard].cells[cellID].contains == 'water') {
            return true
        } else {
            return false
        }
    }
}

const g = new Game(10, 40)
g.renderControlButtons()
g.initBoard('playerBoard')
g.initShips('playerBoard')
g.renderBoardCells('playerBoard')
g.addShip('playerBoard', 0, 'destroyer', 'down')
g.addShip('playerBoard', 1, 'submarine', 'right')