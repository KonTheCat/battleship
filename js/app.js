class Game {
    constructor(boardSideSize, cellSize) {
        this.boardSideSize = boardSideSize
        this.cellSize = cellSize
        this.mode = ''
        this.playerWon
        this.isComputerTurn = false
        this.computerTarget = {
            use: false,
            cells: [],
            directionVertical: false,
            directionHorizontal: false,
            directionCross: false
        }
        this.waitDeploymentDone = true
        this.shipToPlace = {
            board: '',
            type: '',
            orientation: ''
        }
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
                isMouseEnterShipDeployment: false,
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
                },
                deployment: () => {
                    this.addShip(this.shipToPlace.board, this[whichBoard].cells[i].id, this.shipToPlace.type, this.shipToPlace.orientation)
                    this.mode = ''
                    document.querySelectorAll(`button.deploy_${this.shipToPlace.type}`).forEach(button => {
                        button.disabled = true
                    })
                    this.updateAndRender()
                },
                deploymentMouseEnter: () => {
                    this.renderShipDuringDeployment(this.shipToPlace.board, this[whichBoard].cells[i].id, 'enter')
                },
                deploymentMouseLeave: () => {
                    this.renderShipDuringDeployment(this.shipToPlace.board, this[whichBoard].cells[i].id, 'leave')
                }
            }  
        }
    }
    renderShipDuringDeployment(whichBoard, id, enterOrLeave){
        if (this.validateAddShip(whichBoard, id, this[whichBoard].ships[this.shipToPlace.type].size, this.shipToPlace.orientation)) {
            let color = ''
            if (enterOrLeave === 'enter') {
                color = 'grey'
            } else if (enterOrLeave === 'leave') {
                if (this[whichBoard].cells[id].isWater) {
                    color = '#4d5df0'
                } else if (this[whichBoard].cells[id].isShip) {
                    color = 'black'
                }
            }
            let changeFactor = 0
            if (this.shipToPlace.orientation === 'right') {
                changeFactor = 1
            } else if (this.shipToPlace.orientation === 'down') {
                changeFactor = 10
            }
            let currentID = id
            for (let i = 0; i < this[whichBoard].ships[this.shipToPlace.type].size; i++) {
                document.getElementById(`${whichBoard}_${this[whichBoard].cells[currentID].id}`).style.backgroundColor = color
                currentID += changeFactor
            }
        }
    }
    initShips(whichBoard){
        console.log(`running initShips`)
        const ships = {
            carrier: {size: 5, cells: {}, isSunk: false, isPlaced: false},
            battleship: {size: 4, cells: {}, isSunk: false, isPlaced: false},
            submarine: {size: 3, cells: {}, isSunk: false, isPlaced: false},
            cruiser: {size: 3, cells: {}, isSunk: false, isPlaced: false},
            destroyer: {size: 2, cells: {}, isSunk: false, isPlaced: false},
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
                if(whichBoard === 'playerBoard') {
                    console.log(`sunk a ship on the player board, clearing computer target data`)
                    this.clearComputerTarget()
                }
            }
        }
    }
    clearComputerTarget(){
        this.computerTarget.use = false
        this.computerTarget.cells = []
        this.computerTarget.directionHorizontal = false
        this.computerTarget.directionVertical = false
        this.computerTarget.directionCross = false
    }
    renderBoard(whichBoard, noListner = false) {
        this[whichBoard].parent.innerHTML = ''
        this[whichBoard].parent.style.width = `${this.boardSideSize * (this.cellSize + 2)}px`
        this[whichBoard].parent.style.display = "flex"
        this[whichBoard].parent.style.flexWrap = "wrap"
        for (let cell in this[whichBoard].cells) {
            this.renderBoardCell(whichBoard, this[whichBoard].parent, this[whichBoard].cells[cell].id, noListner)
        }
    }
    renderBoardCell(whichBoard, parent, id, noListner = false, style = "1px solid black") {
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
        if (this[whichBoard].cells[id].isMouseEnterShipDeployment){
            cell.style.backgroundColor = 'black'
            cell.style.opacity = '0.8'
        }
        cell.style.height = `${this.cellSize}px`
        cell.style.width = `${this.cellSize}px`
        cell.style.border = style
        cell.id = `${whichBoard}_${id}`
        cell.className = `${whichBoard}_cell`
        if(! noListner) {
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
                case 'over':
                    break
                default:
                    break;
            }
        }
        if (this.mode === 'deployment' && whichBoard === 'playerBoard') {
            cell.addEventListener("click", this[whichBoard].cells[id].deployment)
            cell.addEventListener("mouseleave", this[whichBoard].cells[id].deploymentMouseLeave)
            cell.addEventListener("mouseenter", this[whichBoard].cells[id].deploymentMouseEnter)
        }
        parent.append(cell)
    }
    renderControlButtons(){
        const parent = document.getElementById('control_buttons')
        const resetButton = document.createElement('button')
        resetButton.innerHTML = '<h4>Reset Game</h4>'
        resetButton.addEventListener('click', () => {
            location.reload()
        })
        parent.appendChild(resetButton)
    }
    renderPlayerShipDeploymentButtons(){
        const parent = document.getElementById('ship_deployment_buttons')
        const randomPlayerShipDeploymentButton = document.createElement('button')
        randomPlayerShipDeploymentButton.innerHTML = `Place My Ships Randomly`
        randomPlayerShipDeploymentButton.classList.add(`deploy_randomly`)
        randomPlayerShipDeploymentButton.classList.add(`deploy`)
        randomPlayerShipDeploymentButton.addEventListener('click', () => {
            this.mode = 'deployment'
            console.log(`Game mode set to ${this.mode}`)
            this.placeShipsRandomly('playerBoard')
            this.updateAndRender()
            document.querySelectorAll(`button.deploy`).forEach(button => {
                button.disabled = true
            })
        })
        parent.appendChild(randomPlayerShipDeploymentButton)
        
        const orientations = [
            {
                display: 'Horizontal',
                code: 'right'
            },
            {
                display: 'Vertical',
                code: 'down'
            }
        ]
        for (let ship in this.playerBoard.ships) {
            orientations.forEach(orientation => {
                const newButton = document.createElement('button')
                newButton.innerHTML = `${String(ship)[0].toUpperCase() + String(ship).slice(1)}: ${orientation.display}`
                newButton.classList.add(`deploy_${ship}`)
                newButton.classList.add(`deploy`)
                newButton.addEventListener('click', () => {
                    this.mode = 'deployment'
                    this.shipToPlace.board = 'playerBoard'
                    this.shipToPlace.type = ship
                    this.shipToPlace.orientation = orientation.code
                    console.log(`Game mode set to ${this.mode}`)
                    this.updateAndRender()
                })
                parent.appendChild(newButton)
            })
        }
    }
    addShip(whichBoard, startingCellID, type, downOrRight){
        console.log(`adding ship ${whichBoard}, ${startingCellID}, ${type}, ${downOrRight}`)
        if(! this[whichBoard].ships[type].isPlaced) {
            const size = this[whichBoard].ships[type].size
            if (this.validateAddShip(whichBoard, startingCellID, size, downOrRight)) {
                let currentCellID = startingCellID
                for (let i = 0; i < size; i++) {
                    this[whichBoard].cells[currentCellID].isShip = true
                    this[whichBoard].cells[currentCellID].isWater = false
                    this[whichBoard].cells[currentCellID].contains[type] = this[whichBoard].ships[type]
                    this[whichBoard].ships[type].cells[currentCellID] = {id: currentCellID, isHit: false}
                    if (downOrRight === 'down') {
                        currentCellID += 10
                    } else if (downOrRight === 'right') {
                        currentCellID += 1
                    }
                }
                this[whichBoard].ships[type].isPlaced = true
                this.updateAndRender()
                console.log(`added ship ${whichBoard}, ${startingCellID}, ${type}, ${downOrRight}`)
            } else {
                console.log(`Adding ship failed, validation failure. Request was for board ${whichBoard}, cell ${startingCellID}, type ${type}, downOrRight ${downOrRight}`)
            }
        } else {
            console.log(`the ship ${type} is placed and may not be placed again`)
        }

    }
    validateAddShip(whichBoard, startingCellID, size, downOrRight) {
        let currentCellID = Number(startingCellID)
        const cellsRightCheckSameRow = []
        for (let i = 0; i < size; i++) {
            if (this.validateCellForShipPlacement(whichBoard, currentCellID)) {
                if (downOrRight === 'down') {
                    currentCellID += 10
                } else if (downOrRight === 'right') {
                    cellsRightCheckSameRow.push(currentCellID)
                    currentCellID += 1
                }
            } else {
                //console.log(`returning false from ship placement validation`)
                return false
            }

            if (downOrRight === 'right' && Math.floor(cellsRightCheckSameRow[0] / 10) != Math.floor(cellsRightCheckSameRow[cellsRightCheckSameRow.length - 1] / 10)) {
                //console.log(`returning false from ship placement validation, not same row`)
                return false
            }
        }
        return true
    }
    validateCellForShipPlacement(whichBoard, cellID) {
        if (cellID >= 0 && cellID <= 99 && this[whichBoard].cells[cellID].isWater && !this[whichBoard].cells[cellID].isShip) {
            const validationPatternBox = [-11, -10, -9, -1, 1, 9, 10, 11]
            const nearbyCellsValidationArray = []
            for (let i = 0; i < validationPatternBox.length; i++) {
                const indexToTest = Number(cellID) + Number(validationPatternBox[i])
                nearbyCellsValidationArray.push(this.validateNearbyCellForShipPlacement(whichBoard, indexToTest))
            }
            if (nearbyCellsValidationArray.indexOf(false) >= 0) {
                return false
            } else {
                return true
            }
        } else {
            return false
        }
    }
    validateNearbyCellForShipPlacement(whichBoard, id) {
        if(id <= 0 || id >= 99) {
            return true
        } else {
            if (this[whichBoard].cells[id].isWater && !this[whichBoard].cells[id].isShip) {
                return true
            } else {
                return false
            }
        }
    }
    placeShipsRandomly(whichBoard) {
        for (let ship in this[whichBoard].ships) {
            let downOrRight = getRandomElementFromArray(['down', 'right'])
            const size = this[whichBoard].ships[ship].size
            const cell = this.getCellForRandomShipPlacement(whichBoard, size, downOrRight)
            this.addShip(whichBoard, cell, ship, downOrRight)
            this.updateAndRender()
        }
    }
    getCellForRandomShipPlacement(whichBoard, size, downOrRight) {
        const cellsForShipPlacement = []
        for (let i = 0; i < Object.keys(this[whichBoard].cells).length; i++) {
            if (this.validateAddShip(whichBoard, i, size, downOrRight)) {
                cellsForShipPlacement.push(i)
            }
        }
        if (cellsForShipPlacement.length === 0) {
            console.log(`no valid cells for ship placement`)
            return
        }
        return getRandomElementFromArray(cellsForShipPlacement)
    }
    updateAndRender() {
        this.updateShipsStatus('playerBoard')
        this.updateShipsStatus('computerBoard')
        this.checkPlayerShipDeployment()
        this.checkVictory()
        this.renderBoard('playerBoard', true)
        this.renderBoard('computerBoard')
        this.renderUI()
    }
    renderUI() {
        const gameStatus = document.getElementById('game_status')
        if (this.playerWon === true) {
            gameStatus.innerHTML = 'You won!'
        } else if (this.playerWon === false){
            gameStatus.innerHTML = 'You lost!'
        }
    }
    checkPlayerShipDeployment(){
        if (this.checkAllShipsStatus('playerBoard', 'isPlaced') && this.waitDeploymentDone) {
            console.log(`player ship deployment done`)
            document.querySelectorAll(`button.deploy`).forEach(button => {
                button.disabled = true
            })
            this.mode = 'attack'
            this.waitDeploymentDone = false
            this.updateAndRender()
        }
    }
    updateComputerTarget() {
        if (this.computerTarget.cells.length < 3 && this.computerTarget.use) {
            console.log('we have enough data to set a target direction, but not so much as to make a mess of it')
            if (this.computerTarget.cells.length === 2 && this.computerTarget.directionVertical === false && this.computerTarget.directionHorizontal === false) {
                const cellComparisonResult = this.computerTarget.cells[0] - this.computerTarget.cells[1]
                if (cellComparisonResult === -10 || cellComparisonResult === 10) {
                    console.log(`comparison result is ${cellComparisonResult} setting computer target direction to vertical`)
                    this.computerTarget.directionVertical = true
                    this.computerTarget.directionCross = false
                } else if (cellComparisonResult === 1 || cellComparisonResult === -1) {
                    console.log(`comparison result is ${cellComparisonResult} setting computer target direction to horizontal`)
                    this.computerTarget.directionHorizontal = true
                    this.computerTarget.directionCross = false
                } else {
                    console.log(`unable to set computer target direction based on cell comparison result of ${cellComparisonResult}`)
                    console.log(this.computerTarget)
                }
            } else if (this.computerTarget.cells.length === 1) {
                console.log('setting computer target direction to cross')
                this.computerTarget.directionCross = true
            } else {
                console.log(`unable to set computer target direction based on available data`)
                console.log(this.computerTarget)
            }
        } else {
            console.log(`we do not bother setting the computer target direction at this time`)
        } 
        
    }
    runComputerTurn() {
        console.log(`Computer taking a turn.`)
        this.computerAttackCell()
        this.isComputerTurn = false
    }
    computerAttackCell(){
        const idOfCellToAttack = this.getCellToAttack('playerBoard')
        console.log(`Computer attacking cell ${idOfCellToAttack}`)
        if (this['playerBoard'].cells[idOfCellToAttack].isShip) {
            console.log(`computer hit ship at cell ${idOfCellToAttack}, computer goes again`)
            this['playerBoard'].cells[idOfCellToAttack].isHit = true
            const hitShipKey = Object.keys(this['playerBoard'].cells[idOfCellToAttack].contains)
            this['playerBoard'].ships[hitShipKey].cells[this['playerBoard'].cells[idOfCellToAttack].id].isHit = true
            this.computerTarget.use = true
            this.computerTarget.cells.push(idOfCellToAttack)
            this.updateAndRender()
            this.updateComputerTarget()
            this.computerAttackCell()
            this.updateAndRender()
        }
        if (this['playerBoard'].cells[idOfCellToAttack].isWater) {
            this['playerBoard'].cells[idOfCellToAttack].isHit = true
            console.log('computer hit water')
            this.updateAndRender()
        }
    }
    getAttackableCellsBroadly(whichBoard) {
        const arrayOfAttackableCells = []
        for (let cell in this[whichBoard].cells) {
            if(this[whichBoard].cells[cell].isHit === false) {
                arrayOfAttackableCells.push(cell)
            }
        }
        return arrayOfAttackableCells
    }
    getCellToAttack(whichBoard) {
        const searchPatternCross = [-10, -1, 1, 10]
        const searchPatternVertical = [-10, 10]
        const searchPatternHorizontal = [-1, 1]
        let arrayOfAttackableCells = []
        if (this.computerTarget.use){
            console.log(`computer player hunting narrowly for reasonable targets using stored target data`)
            console.log(this.computerTarget)
            if (this.computerTarget.directionCross) {
                console.log(`the computer player has a single previous hit stored, using the cross search pattern.`)
                arrayOfAttackableCells = this.getAttackableCellsUsingPattern(whichBoard, searchPatternCross)
            }
            if (this.computerTarget.directionVertical) {
                console.log(`computer hunting for target using the vertical search profile`)
                arrayOfAttackableCells = this.getAttackableCellsUsingPattern(whichBoard, searchPatternVertical)
            }
            if (this.computerTarget.directionHorizontal) {
                console.log(`computer hunting for target using the horizontal search profile`)
                arrayOfAttackableCells = this.getAttackableCellsUsingPattern(whichBoard, searchPatternHorizontal)
            }
            if (arrayOfAttackableCells.length === 0) {
                console.log(`there are no squares that its reasonable to attack using stored data, returning to the broad profile`)
                arrayOfAttackableCells = this.getAttackableCellsBroadly('playerBoard')
            } 

        } else {
            arrayOfAttackableCells = this.getAttackableCellsBroadly('playerBoard')
            console.log(`computer is hunting randomly, taking into account all previous hits`)

        }
        return getRandomElementFromArray(arrayOfAttackableCells)
    }
    getAttackableCellsUsingPattern(whichBoard, pattern){
        const attackableCells = []
        this.computerTarget.cells.forEach(cellInTarget => {
            pattern.forEach(searchPatternElemenet => {
                const idToTest = Number(cellInTarget) + Number(searchPatternElemenet)
                if (idToTest >= 0 && idToTest < 100) {
                    if (!this[whichBoard].cells[idToTest].isHit){
                        attackableCells.push(idToTest)
                    }
                }
            })
        })
        return attackableCells
    } 
    checkVictory() {
        if (this.checkIfAllShipsSunk('playerBoard')) {
            this.playerWon = false
            this.mode = 'over'
            console.log(`all player ships sunk, computer wins`)
        }
        if (this.checkIfAllShipsSunk('computerBoard')) {
            this.playerWon = true
            this.mode = 'over'
            console.log(`all computer ships sunk, player wins`)
        }
    }
    checkIfAllShipsSunk(whichBoard) {
        let sunkShipCounter = 0
        for (let ship in this[whichBoard].ships) {
            if (this[whichBoard].ships[ship].isSunk) {
                sunkShipCounter ++
            }
        }
        return sunkShipCounter === 5
    }
    checkAllShipsStatus(whichBoard, status) {
        let shipCounter = 0
        for (let ship in this[whichBoard].ships) {
            if (this[whichBoard].ships[ship][status]) {
                shipCounter ++
            }
        }
        return shipCounter === 5
    }
    unhideBoard(whichBoard){
        for (let cell in this[whichBoard].cells) {
            this[whichBoard].cells[cell].isHidden = false
        }
        this.updateAndRender()
    }
    demo() {
        this.unhideBoard('computerBoard')
    }
}

// Main Game Controller

const g = new Game(10, 40)
g.renderControlButtons()
g.initBoard('playerBoard', false)
g.initShips('playerBoard')
g.initBoard('computerBoard', true)
g.initShips('computerBoard')
g.renderPlayerShipDeploymentButtons()
g.placeShipsRandomly('computerBoard')

// End of Main Game Controller

function getRandomElementFromArray(array) {
    const randomIndex = Math.floor(Math.random() * array.length)
    return array[randomIndex]
}