class Game {
    constructor(boardSideSize, cellSize) {
        this.boardSideSize = boardSideSize
        this.cellSize = cellSize
        this.mode = 'inspect'
        this.state = 'playing'
        this.isComputerTurn = false
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
    initBoard(whichBoard, initIsHidden) {
        console.log(`running initBoard`)
        for (let i = 0; i < this.boardSideSize * this.boardSideSize; i++) {
            this[whichBoard].cells[i] = {
                id: i,
                contains: {},
                isHit: false,
                isSunk: false,
                isHidden: initIsHidden,
                isWater: true,
                isShip: false,
                identify: () => {
                    console.log(`I am cell ${this[whichBoard].cells[i].id}, my details are below.`)
                    console.log(this[whichBoard].cells[i])
                },
                reveal: () => {
                    console.log(`revealing cell with id ${this[whichBoard].cells[i].id}`)
                    this[whichBoard].cells[i].isHidden = false
                    this.updateAndRender()
                },
                attack: () => {
                    console.log(`attacking cell with id ${this[whichBoard].cells[i].id}`)
                    if (! this[whichBoard].cells[i].isHit) {
                        this[whichBoard].cells[i].isHit = true
                        if (this[whichBoard].cells[i].isShip){
                            const hitShipKey = Object.keys(this[whichBoard].cells[i].contains)
                            this[whichBoard].ships[hitShipKey].cells[this[whichBoard].cells[i].id].isHit = true
                            console.log(`You have hit a ship, it is a ${hitShipKey}. The status of this ship is returned below`)
                            console.log(this[whichBoard].ships[hitShipKey])
                        } else if (this[whichBoard].cells[i].isWater) {
                            console.log(`You have hit a water`)
                            this.isComputerTurn = true
                            this.runComputerTurn()
                        }
                        this[whichBoard].cells[i].isHidden = false
                    } else {
                        console.log(`cell was already attacked`)
                    }
                    this.updateAndRender()
                }
            }  
        }
    }
    initShips(whichBoard){
        console.log(`running initShips`)
        const ships = {
            destroyer: {size: 2, cells: {}, isSunk: false, isPlaced: false},
            submarine: {size: 3, cells: {}, isSunk: false, isPlaced: false},
            cruiser: {size: 3, cells: {}, isSunk: false, isPlaced: false},
            battleship: {size: 4, cells: {}, isSunk: false, isPlaced: false},
            carrier: {size: 5, cells: {}, isSunk: false, isPlaced: false},
        }
        for (let ship in ships) {
            let initedShip = ships[ship]
            this[whichBoard].ships[ship] = initedShip
        }
    }
    updateShipsStatus(whichBoard) {
        for (let ship in this[whichBoard].ships) {
            this.updateShipStatus(whichBoard, ship)
        }
    }
    updateShipStatus(whichBoard, ship) {
        if (this[whichBoard].ships[ship].isPlaced && !this[whichBoard].ships[ship].isSunk) {
            let intactCellsInShip = 0
            for (let cell in this[whichBoard].ships[ship].cells){
                if (! this[whichBoard].ships[ship].cells[cell].isHit) {
                    intactCellsInShip += 1
                } 
            }
            if (intactCellsInShip === 0) {
                console.log(`The ${ship} on ${whichBoard} is sunk`)
                this[whichBoard].ships[ship].isSunk = true
                for (let cell in this[whichBoard].ships[ship].cells) {
                    this[whichBoard].cells[cell].isSunk = true
                }
            }
        }
    }
    renderBoard(whichBoard) {
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
        if (this[whichBoard].cells[id].isShip) {
            cell.style.backgroundColor = 'black'
        }
        if (this[whichBoard].cells[id].isWater) {
            cell.style.backgroundColor = '#4d5df0'
        }
        if (this[whichBoard].cells[id].isHidden) {
            cell.style.backgroundColor = 'white'
        } 
        if (this[whichBoard].cells[id].isHit) {
            cell.innerHTML = 'H'
            cell.style.color = 'red'
            cell.style.fontWeight = 'bolder'
            cell.style.alignContent = 'center'
            cell.style.fontSize = `${this.cellSize * .75}px`
        }
        if (this[whichBoard].cells[id].isSunk) {
            cell.innerHTML = 'S'
        }
        if (this[whichBoard].cells[id].isHit && this[whichBoard].cells[id].isWater){
            cell.innerHTML = 'M'
            cell.style.color = 'black'
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
            case 'attack':
                cell.addEventListener("click", this[whichBoard].cells[id].attack)
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
            this.updateAndRender()
        })
        parent.appendChild(newButton)

        newButton = document.createElement('button')
        newButton.innerHTML = `<h4>Inspect</h4>`
        newButton.addEventListener('click', () => {
            this.mode = 'inspect'
            console.log(`Game mode set to ${this.mode}`)
            this.updateAndRender()
        })
        parent.appendChild(newButton)

        newButton = document.createElement('button')
        newButton.innerHTML = `<h4>Attack</h4>`
        newButton.addEventListener('click', () => {
            this.mode = 'attack'
            console.log(`Game mode set to ${this.mode}`)
            this.updateAndRender()
        })
        parent.appendChild(newButton)
    }
    addShip(whichBoard, startingCellID, type, downOrRight){
        const size = this[whichBoard].ships[type].size
        if (this.validateAddShip(whichBoard, startingCellID, size, downOrRight)) {
            let currentCellID = startingCellID
            let shipObjectCellIterator = 0
            for (let i = 0; i < size; i++) {
                this[whichBoard].cells[currentCellID].isShip = true
                this[whichBoard].cells[currentCellID].isWater = false
                this[whichBoard].cells[currentCellID].contains[type] = this[whichBoard].ships[type]
                this[whichBoard].ships[type].cells[currentCellID] = {id: currentCellID, isHit: false}
                shipObjectCellIterator ++
                if (downOrRight === 'down') {
                    currentCellID += 10
                } else if (downOrRight === 'right') {
                    currentCellID += 1
                }
            }
            this[whichBoard].ships[type].isPlaced = true
            this.updateAndRender()
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
        if (this[whichBoard].cells[cellID].isWater) {
            return true
        } else {
            return false
        }
    }
    updateAndRender() {
        this.updateShipsStatus('playerBoard')
        this.updateShipsStatus('computerBoard')
        this.renderBoard('playerBoard')
        this.renderBoard('computerBoard')
    }
    runComputerTurn() {
        console.log(`Computer taking a turn.`)
        this.computerAttackCell()
        this.isComputerTurn = false
    }
    computerAttackCell() {
        const idOfCellToAttack = this.getCellToAttack('playerBoard')
        console.log(`Computer attacking cell ${idOfCellToAttack}`)
        if (this['playerBoard'].cells[idOfCellToAttack].isShip) {
            console.log(`computer hit ship at cell ${idOfCellToAttack}, computer goes again`)
            this['playerBoard'].cells[idOfCellToAttack].isHit = true
            const hitShipKey = Object.keys(this['playerBoard'].cells[idOfCellToAttack].contains)
            this['playerBoard'].ships[hitShipKey].cells[this['playerBoard'].cells[idOfCellToAttack].id].isHit = true
            this.updateAndRender()
            this.computerAttackCell()
        }
        if (this['playerBoard'].cells[idOfCellToAttack].isWater) {
            this['playerBoard'].cells[idOfCellToAttack].isHit = true
            console.log('computer hit water')
        }
    }
    getCellToAttack(whichBoard) {
        const arrayOfAttackableCells = []
        for (let cell in this[whichBoard].cells) {
            if(this[whichBoard].cells[cell].isHit === false) {
                arrayOfAttackableCells.push(cell)
            }
        }
        return getRandomElementFromArray(arrayOfAttackableCells)
    }
}

// Main Game Controller
const g = new Game(10, 40)
g.renderControlButtons()
g.initBoard('playerBoard', false)
g.initShips('playerBoard')
g.initBoard('computerBoard', true)
g.initShips('computerBoard')
g.addShip('playerBoard', 20, 'destroyer', 'down')
g.addShip('playerBoard', 1, 'submarine', 'right')
g.addShip('playerBoard', 8, 'cruiser', 'down')
g.addShip('playerBoard', 91, 'carrier', 'right')
g.addShip('playerBoard', 45, 'battleship', 'down')
g.addShip('computerBoard', 20, 'destroyer', 'down')
g.addShip('computerBoard', 1, 'submarine', 'right')
g.addShip('computerBoard', 8, 'cruiser', 'down')
g.addShip('computerBoard', 91, 'carrier', 'right')
g.addShip('computerBoard', 45, 'battleship', 'down')


// End of Main Game Controller

function getRandomElementFromArray(array) {
    const randomIndex = Math.floor(Math.random() * array.length)
    return array[randomIndex]
}