Vue.config.productionTip = false;
let board = new Array(9);
for (let i = 0; i < 9; i++) {
    board[i] = new Array(9);
    for (let j = 0; j < 9; j++) {
        board[i][j] = null;
    }

}

function isValid(cellContent) {
    if ([1, 2, 3, 4, 5, 6, 7, 8, 9].indexOf(cellContent) !== -1)
        return true;
    return false;
}

function rowCheck(board) {
    let remains = new Array(9);
    for (let row = 0; row < board.length; row++) {

        let alternative = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let cell = 0; cell < board[row].length; cell++) {
            if (!isNaN(board[row][cell]) && isValid(board[row][cell]))
                alternative[board[row][cell] - 1] = null;
        }
        remains[row] = alternative;
    }
    return remains;
}

function colCheck(board) {
    let remains = new Array(9);
    for (let col = 0; col < board.length; col++) {

        let alternative = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let cell = 0; cell < board[col].length; cell++) {
            if (!isNaN(board[cell][col]) && isValid(board[cell][col]))
                alternative[board[cell][col] - 1] = null;
        }
        remains[col] = alternative;
    }
    return remains;
}

function blockCheck(board) {
    let remains = new Array(9);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let alternative = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    if (!isNaN(board[3 * i + x][3 * j + y]) && isValid(board[3 * i + x][3 * j + y]))
                        alternative[board[3 * i + x][3 * j + y] - 1] = null;
                }
            }
            remains[3 * i + j] = alternative;
        }
    }
    return remains;
}


let STORAGE_KEY = 'sodoku';
if (sessionStorage.getItem(STORAGE_KEY) == null)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(board));
let sodokuStorage = {
    fetch: function () {
        let sodokuFilled = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
        return sodokuFilled;
    },
    save: function (boardFilled) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(boardFilled));
    }
}

let sodoku = new Vue({
    el: '#sodoku_board',
    data() {
        return {
            // fill: board,
            fill: sodokuStorage.fetch(),
            hint: "",
            mark: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            disabled: new Array(9).fill(1).map(x => new Array(9))
        }
    },
    watch: {
        fill(newValue, oldValue) {
            sodokuStorage.save(newValue);
        }
    },

    methods: {
        rowRemains() {
            return rowCheck(this.fill);
        },
        colRemains() {
            return colCheck(this.fill);
        },
        blockRemains() {
            return blockCheck(this.fill);
        },
        validAlert(i, j, event) {
            if (!isValid(this.fill[i][j]) && this.fill[i][j] || this.fill[i][j] === 0) {
                alert(this.fill[i][j] + ' 不对呀，重新输一个吧');
                this.$set(this.fill[i], j, null);
                event.currentTarget.focus();
                return;
            }

            let rowDuplicate = false;
            let colDuplicate = false;
            let blockDuplicate = false;

            for (let k = 0; k < 9; k++) {
                if (j != k && this.fill[i][k] === this.fill[i][j] && this.fill[i][j]) {
                    rowDuplicate = true;
                }
            }

            for (let k = 0; k < 9; k++) {
                if (i != k && this.fill[k][j] === this.fill[i][j] && this.fill[i][j]) {
                    colDuplicate = true;
                }
            }

            for (let k = 0; k < 3; k++) {
                for (let m = 0; m < 3; m++) {
                    let row = Math.floor(i / 3) * 3 + k;
                    let col = Math.floor(j / 3) * 3 + m;
                    if (this.fill[row][col] === this.fill[i][j] && this.fill[i][j] && (row !== i || col !== j)) {
                        blockDuplicate = true;
                    }
                }
            }


            if (rowDuplicate || colDuplicate || blockDuplicate) {
                let message = (rowDuplicate ? `${this.fill[i][j]} 在这一行里面已经有啦\n` : "")
                    + (colDuplicate ? `${this.fill[i][j]} 在这一列里面已经有啦\n` : "")
                    + (blockDuplicate ? `${this.fill[i][j]} 在这一九宫格里面已经有啦` : "");
                alert(message);
                rowDuplicate = false;
                colDuplicate = false;
                blockDuplicate = false;
                this.$set(this.fill[i], j, null);
                event.currentTarget.focus();
            }

        },
        nextHint(i, j, event) {
            if (isValid(this.fill[i][j])) {
                this.hint = null;
                return;
            }
            let forbidden = new Array();
            for (let k = 0; k < 9; k++) {
                if (k != j && isValid(this.fill[i][k]))
                    forbidden.push(this.fill[i][k]);
                if (k != i && isValid(this.fill[k][j]))
                    forbidden.push(this.fill[k][j]);
            }
            for (let k = 0; k < 3; k++) {
                for (let m = 0; m < 3; m++) {
                    let row = Math.floor(i / 3) * 3 + k;
                    let col = Math.floor(j / 3) * 3 + m;
                    if (!(row === i && col === j) && isValid(this.fill[row][col]))
                        forbidden.push(this.fill[row][col]);
                }
            }
            let options = new Array();
            for (let k = 0; k < 9; k++) {
                if (forbidden.indexOf(k + 1) === -1)
                    options.push(k + 1);
            }
            this.hint = options.sort().join("   ");
        },
        clearHint() {
            this.hint = null;
            return;
        },
        clearAll() {
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    this.$set(this.fill[i], j, null)
                }
            }
        },
        lock() {
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    this.$set(this.disabled[i], j, isValid(this.fill[i][j]))
                }
            }
        },
        unlock() {
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    this.$set(this.disabled[i], j, false)
                }
            }
        },
        erase() {
            let lockerAll = this.$el.firstChild.firstChild;
            for (let i = 0; i < 9; i++) {
                let lockerRow = lockerAll.childNodes[i];
                for (let j = 0; j < 9; j++) {
                    let locker = lockerRow.childNodes[j].firstChild;
                    if (!locker.disabled) {
                        this.$set(this.fill[i], j, null)
                    }
                }
            }
        },
        reveal(number) {
            let occupied = new Array(9);
            for (let i = 0; i < 9; i++) {
                occupied[i] = new Array(9);
                for (let j = 0; j < 9; j++) {
                    occupied[i][j] = false;
                }
            }
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    let rowDuplicate = false;
                    let colDuplicate = false;
                    let blockDuplicate = false;

                    for (let k = 0; k < 9; k++) {
                        if (this.fill[i][k] === number) {
                            rowDuplicate = true;
                        }
                    }

                    for (let k = 0; k < 9; k++) {
                        if (this.fill[k][j] === number) {
                            colDuplicate = true;
                        }
                    }

                    for (let k = 0; k < 3; k++) {
                        for (let m = 0; m < 3; m++) {
                            let row = Math.floor(i / 3) * 3 + k;
                            let col = Math.floor(j / 3) * 3 + m;
                            if (this.fill[row][col] === number) {
                                blockDuplicate = true;
                            }
                        }
                    }

                    occupied[i][j] = rowDuplicate || colDuplicate || blockDuplicate || isValid(this.fill[i][j]);
                }
            }

            let locker = this.$el.firstChild.firstChild;

            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (occupied[i][j] == false) {
                        locker.childNodes[i].childNodes[j].style.backgroundColor = 'rgb(24,232,38)';
                    } else {
                        locker.childNodes[i].childNodes[j].style.backgroundColor = 'rgb(252,91,80)';
                    }
                }
            }
        },
        revealHide() {

            let locker = this.$el.firstChild.firstChild;
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    locker.childNodes[i].childNodes[j].style.backgroundColor = null;
                }
            }
        }
    }
})

