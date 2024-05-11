const validationPatternGridBox = [
    {
        rowDelta: -1,
        colDelta: -1
    },
    {
        rowDelta: -1,
        colDelta: 0
    },
    {
        rowDelta: -1,
        colDelta: 1
    },
    {
        rowDelta: 0,
        colDelta: -1
    },
    {
        rowDelta: 0,
        colDelta: 1
    },
    {
        rowDelta: 1,
        colDelta: -1
    },
    {
        rowDelta: 1,
        colDelta: 0
    },
    {
        rowDelta: 1,
        colDelta: 1
    }
]

const searchPatternGridCross = [
    {
        rowDelta: -1,
        colDelta: 0
    },
    {
        rowDelta: 0,
        colDelta: -1
    },
    {
        rowDelta: 0,
        colDelta: 1
    },
    {
        rowDelta: 1,
        colDelta: 0
    },
]

const searchPatternGridVertical = [
    {
        rowDelta: -1,
        colDelta: 0
    },
    {
        rowDelta: 1,
        colDelta: 0
    },
]

const searchPatternGridHorizontal = [
    {
        rowDelta: 0,
        colDelta: -1
    },
    {
        rowDelta: 0,
        colDelta: 1
    },
]

const freeSpaceDetectionPattern = [
    {
        rowDelta: 1,
        colDelta: 0
    },
    {
        rowDelta: -1,
        colDelta: 0
    },
    {
        rowDelta: 0,
        colDelta: 1
    },
    {
        rowDelta: 0,
        colDelta: -1
    }
]

const colorOfWater = '#4d5df0'

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
        this.log = {
            parent: document.getElementById('log'),
            entries: []
        }
    }
    writeLog(source, message) {
        this.log.entries.push(
            {
                source: source,
                message: message
            }
        )
    }
    renderLog() {
        this.log.parent.innerHTML = ''
        this.log.entries.forEach(entry => {
            const entryElement = document.createElement('p')
            const sourceElemenet = document.createElement('span')
            sourceElemenet.style.fontWeight = 'bolder'
            sourceElemenet.innerHTML = `${entry.source}: `
            const messageElemenet = document.createElement('span')
            messageElemenet.innerHTML = `${entry.message}`
            entryElement.appendChild(sourceElemenet)
            entryElement.appendChild(messageElemenet)
            this.log.parent.prepend(entryElement)
        })
    }
    initBoard(whichBoard, initIsHidden) {
        let row = 0
        let col = 0
        for (let i = 0; i < this.boardSideSize * this.boardSideSize; i++) {
            this[whichBoard].cells[i] = {
                id: i,
                row: row,
                col: col,
                contains: {},
                isHit: false,
                isSunk: false,
                isHidden: initIsHidden,
                isWater: true,
                isShip: false,
                isMouseEnterShipDeployment: false,
                attack: () => {
                    if (! this[whichBoard].cells[i].isHit) {
                        this[whichBoard].cells[i].isHit = true
                        if (this[whichBoard].cells[i].isShip){   
                            const hitShipKey = Object.keys(this[whichBoard].cells[i].contains)
                            this[whichBoard].ships[hitShipKey].cells[this[whichBoard].cells[i].id].isHit = true
                            this.writeLog('Player', 'You have hit a computer ship!')
                        } else if (this[whichBoard].cells[i].isWater) {
                            this.writeLog('Player', 'You have hit water.')
                            this.isComputerTurn = true
                            this.runComputerTurn()
                        }
                        this[whichBoard].cells[i].isHidden = false
                    }
                    this.updateAndRender()
                },
                attackMouseOver: () => {
                    document.getElementById(`${whichBoard}_${i}`).style.cursor = 'crosshair'
                },
                deployment: () => {
                    this.addShip(this.shipToPlace.board, this[whichBoard].cells[i].id, this.shipToPlace.type, this.shipToPlace.orientation)
                    this.updateAndRender()
                },
                deploymentMouseEnter: () => {
                    this.renderShipDuringDeployment(this.shipToPlace.board, this[whichBoard].cells[i].id, 'enter')
                },
                deploymentMouseLeave: () => {
                    this.renderShipDuringDeployment(this.shipToPlace.board, this[whichBoard].cells[i].id, 'leave')
                }
            }
            col++
            if (col > (this.boardSideSize - 1)) {
                col = 0
                row++
            }
        }
    }
    validateGrid(row, col) {
        const validateArray = [row, col]
        for (let i = 0; i < validateArray.length; i++){
            if(validateArray[i] < 0 || validateArray[i] > this.boardSideSize - 1) {
                return false
            }
        }
        return true
    }
    convertGridToID(row, col) {
        return (row * this.boardSideSize) + col
    }
    convertIDToGrid(id) {
        return {
            row: Math.floor(id / this.boardSideSize),
            col: id % this.boardSideSize
        }
    }
    renderShipDuringDeployment(whichBoard, id, enterOrLeave){
        if (this.validateAddShip(whichBoard, id, this[whichBoard].ships[this.shipToPlace.type].size, this.shipToPlace.orientation)) {
            let color = ''
            if (enterOrLeave === 'enter') {
                color = 'grey'
            } else if (enterOrLeave === 'leave') {
                if (this[whichBoard].cells[id].isWater) {
                    color = colorOfWater
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
                this.writeLog('System', `The ${ship} on ${whichBoard} is sunk`)
                this.checkVictory()
                this[whichBoard].ships[ship].isSunk = true
                for (let cell in this[whichBoard].ships[ship].cells) {
                    this[whichBoard].cells[cell].isSunk = true
                }
                if(whichBoard === 'playerBoard') {
                    this.writeLog('Computer', 'Since I have sunk one of your ships I now erase my target data and return to the hunt.')
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
            cell.style.backgroundColor = colorOfWater
        }
        if (this[whichBoard].cells[id].isHidden) {
            cell.style.backgroundColor = 'white'
        } 
        if (this[whichBoard].cells[id].isHit) {
            cell.innerHTML = '<p>H</p>'
            cell.style.color = 'red'
            cell.style.fontWeight = 'bolder'
            cell.style.display = 'flex'
            cell.style.justifyContent = 'center'
            cell.style.alignItems = 'center'
            cell.style.fontSize = `${this.cellSize * .75}px`
        }
        if (this[whichBoard].cells[id].isSunk) {
            cell.innerHTML = '<p>S</p>'
        }
        if (this[whichBoard].cells[id].isHit && this[whichBoard].cells[id].isWater){
            cell.innerHTML = '<p>M</p>'
            cell.style.color = 'black'
        }
        cell.style.height = `${this.cellSize}px`
        cell.style.width = `${this.cellSize}px`
        cell.style.border = style
        cell.id = `${whichBoard}_${id}`
        cell.className = `${whichBoard}_cell`
        if(this.mode === 'attack' && whichBoard === 'computerBoard') {
            cell.addEventListener("click", this[whichBoard].cells[id].attack)
            cell.addEventListener("mouseover", this[whichBoard].cells[id].attackMouseOver)
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
                    this.updateAndRender()
                })
                parent.appendChild(newButton)
            })
        }
    }
    addShip(whichBoard, startingCellID, type, downOrRight){
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
                if (whichBoard === 'playerBoard') {
                    document.querySelectorAll(`button.deploy_${type}`).forEach(button => {
                        button.disabled = true
                    })
                    this.mode = 'null'
                }
                this.updateAndRender()
            }
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
                return false
            }
            if (downOrRight === 'right' && Math.floor(cellsRightCheckSameRow[0] / 10) != Math.floor(cellsRightCheckSameRow[cellsRightCheckSameRow.length - 1] / 10)) {
                return false
            }
        }
        return true
    }
    validateCellForShipPlacement(whichBoard, cellID) {
        if (cellID >= 0 && cellID <= 99 && this[whichBoard].cells[cellID].isWater && !this[whichBoard].cells[cellID].isShip) {
            const nearbyCellsValidationArray = []
            for (let i = 0; i < validationPatternGridBox.length; i++) {
                const grid = this.convertIDToGrid(cellID)
                const rowToValidate = grid.row + validationPatternGridBox[i].rowDelta
                const colToValidate = grid.col + validationPatternGridBox[i].colDelta
                nearbyCellsValidationArray.push(this.validateNearbyCellForShipPlacement(whichBoard, rowToValidate, colToValidate))
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
    validateNearbyCellForShipPlacement(whichBoard, row, col) {
        if(!this.validateGrid(row, col)) {
            return true
        } else {
            const id = this.convertGridToID(row, col)
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
            return
        }
        return getRandomElementFromArray(cellsForShipPlacement)
    }
    updateAndRender() {
        this.updateShipsStatus('playerBoard')
        this.updateShipsStatus('computerBoard')
        this.checkPlayerShipDeployment()
        this.checkVictory()
        this.renderBoard('playerBoard')
        this.renderBoard('computerBoard')
        this.renderUI()
        this.renderLog()
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
            this.writeLog('System', 'Player ship deployment finished, the battle begins!')
            document.querySelectorAll(`button.deploy`).forEach(button => {
                button.disabled = true
            })
            document.getElementById('ship_deployment_buttons').style.display = "none"
            document.getElementById('log_container').style.display = "block"
            this.mode = 'attack'
            this.waitDeploymentDone = false
            this.updateAndRender()
        }
    }
    updateComputerTarget() {
        if (this.computerTarget.cells.length < 3 && this.computerTarget.use) {
            if (this.computerTarget.cells.length === 2 && this.computerTarget.directionVertical === false && this.computerTarget.directionHorizontal === false) {
                const cellComparisonResult = this.computerTarget.cells[0] - this.computerTarget.cells[1]
                if (cellComparisonResult === -10 || cellComparisonResult === 10) {
                    this.writeLog('Computer', 'I now know enough to hunt for this ship in the vertical!')
                    this.computerTarget.directionVertical = true
                    this.computerTarget.directionCross = false
                } else if (cellComparisonResult === 1 || cellComparisonResult === -1) {
                    this.writeLog('Computer', 'I now know enough to hunt for this ship in the horizontal!')
                    this.computerTarget.directionHorizontal = true
                    this.computerTarget.directionCross = false
                }
            } else if (this.computerTarget.cells.length === 1) {
                this.writeLog('Computer', "There's a whole ship around here somewhere!")
                this.computerTarget.directionCross = true
            }
        }
    }
    runComputerTurn() {
        this.writeLog(`Computer`, 'My turn now!')
        this.computerAttackCell()
        this.isComputerTurn = false
    }
    computerAttackCell(){
        const idOfCellToAttack = this.getCellToAttack('playerBoard')
        if (this['playerBoard'].cells[idOfCellToAttack].isShip) {
            this.writeLog(`Computer`, 'I have hit a ship, I go again!')
            this['playerBoard'].cells[idOfCellToAttack].isHit = true
            const hitShipKey = Object.keys(this['playerBoard'].cells[idOfCellToAttack].contains)
            this['playerBoard'].ships[hitShipKey].cells[this['playerBoard'].cells[idOfCellToAttack].id].isHit = true
            this.computerTarget.use = true
            this.computerTarget.cells.push(idOfCellToAttack)
            this.updateAndRender()
            this.updateComputerTarget()
            if (this.state !== 'over') {
                this.computerAttackCell()
                this.updateAndRender()
            }
        }
        if (this['playerBoard'].cells[idOfCellToAttack].isWater) {
            this['playerBoard'].cells[idOfCellToAttack].isHit = true
            this.writeLog(`Computer`, 'I have hit water, for now.')
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
    getGoodTargetCells(whichBoard){
        const arrayOfProspectiveGoodTargetCells = this.getAttackableCellsBroadly(whichBoard)
        for (let i = 0; i < arrayOfProspectiveGoodTargetCells.length; i++) {
            if(this.getCellIsNextToASunkShip(whichBoard, arrayOfProspectiveGoodTargetCells[i])) {
                delete arrayOfProspectiveGoodTargetCells[i]
            }
        }
        const arrayOfGoodTargetCells = arrayOfProspectiveGoodTargetCells.filter(n => n)
        return arrayOfGoodTargetCells
    }
    getBetterTargetCell(whichBoard) {
        const arrayOfGoodTargetCells = this.getGoodTargetCells(whichBoard)
        const arrayOfCellsWithFreeSpace = []
        arrayOfGoodTargetCells.forEach(cellElemenet => {
            arrayOfCellsWithFreeSpace.push({
                id: cellElemenet,
                freeSpace: this.getCellFreeSpaceUsingGrid(whichBoard, cellElemenet)
            })
        })
        arrayOfCellsWithFreeSpace.sort((a, b) => b.freeSpace - a.freeSpace)
        const arrayOfCellsWithMostFreeSpace = arrayOfCellsWithFreeSpace.slice(0, Math.floor(arrayOfCellsWithFreeSpace.length / 4))
        const arrayOfBetterTargetCells = [] 
        arrayOfCellsWithMostFreeSpace.forEach(element => {
            arrayOfBetterTargetCells.push(element.id)
        })
        return arrayOfBetterTargetCells
    }
    getCellFreeSpaceUsingGrid(whichBoard, id) {
        let freeSpace = 0
        freeSpaceDetectionPattern.forEach(patternElement => {
            let currentCellID = id
            while (! this[whichBoard].cells[currentCellID].isHit) {
                freeSpace ++
                let currentGrid = this.convertIDToGrid(currentCellID)
                currentGrid.col += patternElement.colDelta
                currentGrid.row += patternElement.rowDelta
                if (this.validateGrid(currentGrid.row, currentGrid.col)) {
                    currentCellID = this.convertGridToID(currentGrid.row, currentGrid.col)
                    if(!(currentCellID >= 0 && currentCellID <= 99)) {
                        break
                    }
                } else {
                    break
                }                
            }
        })
        return freeSpace
    }
    getCellIsNextToASunkShip(whichBoard, cell) {
        const sunkCellsNearby = []
        validationPatternGridBox.forEach(patternElement => {
            const grid = this.convertIDToGrid(cell)
            const prospectiveRow = grid.row + patternElement.rowDelta
            const prospectiveCol = grid.col + patternElement.colDelta
            if (this.validateGrid(prospectiveRow, prospectiveCol) ) {
                const prospectiveCell = this.convertGridToID(prospectiveRow, prospectiveCol)
                if (this[whichBoard].cells[prospectiveCell].isSunk) {
                    sunkCellsNearby.push(prospectiveCell)
                }
            }
        })
        if (sunkCellsNearby.length === 0) {
            return false
        } else {
            return true
        }
    }
    getCellToAttack(whichBoard) {
        let arrayOfAttackableCells = []
        if (this.computerTarget.use){
            if (this.computerTarget.directionCross) {
                arrayOfAttackableCells = this.getAttackableCellsUsingPattern(whichBoard, searchPatternGridCross)
            }
            if (this.computerTarget.directionVertical) {
                arrayOfAttackableCells = this.getAttackableCellsUsingPattern(whichBoard, searchPatternGridVertical)
            }
            if (this.computerTarget.directionHorizontal) {
                arrayOfAttackableCells = this.getAttackableCellsUsingPattern(whichBoard, searchPatternGridHorizontal)
            }
            if (arrayOfAttackableCells.length === 0) {
                arrayOfAttackableCells = this.getBetterTargetCell('playerBoard')
            }
        } else {
            arrayOfAttackableCells = this.getBetterTargetCell('playerBoard')
        }
        return getRandomElementFromArray(arrayOfAttackableCells)
    }
    getAttackableCellsUsingPattern(whichBoard, pattern){
        const attackableCells = []
        this.computerTarget.cells.forEach(cellInTarget => {
            pattern.forEach(searchPatternElemenet => {
                const grid = this.convertIDToGrid(cellInTarget)
                const rowToValidate = grid.row + searchPatternElemenet.rowDelta
                const colToValidate = grid.col + searchPatternElemenet.colDelta
                if (this.validateGrid(rowToValidate, colToValidate)) {
                    const idToTest = this.convertGridToID(rowToValidate, colToValidate)
                    if (!this[whichBoard].cells[idToTest].isHit){
                        attackableCells.push(idToTest)
                    }
                }
            })
        })
        return attackableCells
    } 
    checkVictory() {
        if (this.mode !== 'over') {
            if (this.checkAllShipsStatus('playerBoard', 'isSunk')) {
                this.playerWon = false
                this.mode = 'over'
                this.writeLog('System', 'Computer wins!')
            }
            if (this.checkAllShipsStatus('computerBoard', 'isSunk')) {
                this.playerWon = true
                this.mode = 'over'
                this.writeLog('System', 'Player wins!')
            }
        }
    }
    checkAllShipsStatus(whichBoard, status) {
        let shipCounter = 0
        for (let ship in this[whichBoard].ships) {
            if (this[whichBoard].ships[ship][status]) {
                shipCounter ++
            }
        }
        return shipCounter === Object.keys(this[whichBoard].ships).length
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