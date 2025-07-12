const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const UNIT = 80
const WIDTH = 1600
const HEIGHT = 800
const bombCount = 25

canvas.width = WIDTH
canvas.height = HEIGHT

const colors = {
    1: "blue",
    2: "darkgreen",
    3: "red",
    4: "purple",
    5: "brown",
    6: "pink",
    7: "black",
    8: "gray"
};

class Box {
    constructor(position, bomb, number, show, unit) {
        this.position = position;
        this.bomb = bomb;
        this.number = number;
        this.show = show;
        this.unit = unit;

        this.color = "darkgray";
        this.textColor = colors[number] || "black";

        this.rect = {
            x: position[0],
            y: position[1],
            width: unit,
            height: unit
        };

        this.top = null;
        this.topRight = null;
        this.topLeft = null;
        this.right = null;
        this.left = null;
        this.bottom = null;
        this.bottomRight = null;
        this.bottomLeft = null;
    }

    click(n = 0) {
        if (this.show) return n;
        n += 1;
        this.show = true;
        this.color = "lightgray";

        if (this.number === 0) {
            const neighbors = [
                this.topLeft, this.top, this.topRight,
                this.left, this.right,
                this.bottomLeft, this.bottom, this.bottomRight
            ];
            for (const neighbor of neighbors) {
                if (neighbor && !neighbor.show) {
                    n = neighbor.click(n);
                }
            }
        }

        return n;
    }

    draw(ctx) {
    const { x, y, width, height } = this.rect;

    ctx.fillStyle = this.color;
    ctx.fillRect(x, y, width, height);

    if (!this.show) {
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(x + width, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + height);
        ctx.stroke();

        ctx.strokeStyle = "gray";
        ctx.beginPath();
        ctx.moveTo(x, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x + width, y);
        ctx.stroke();
    } else {
        ctx.strokeStyle = "black";
        ctx.strokeRect(x, y, width, height);
    }

    if (this.show && this.number !== 0) {
        ctx.fillStyle = this.textColor;
        ctx.font = `${this.unit * 0.6}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const text = this.bomb ? "X" : this.number.toString();
        ctx.fillText(text, x + width / 2, y + height / 2);
    }
}

    contains(x, y) {
        return (
            x >= this.rect.x &&
            x <= this.rect.x + this.rect.width &&
            y >= this.rect.y &&
            y <= this.rect.y + this.rect.height
        );
    }
}

class Board {
    constructor(width, height, unit, bombCount) {
        this.width = width;
        this.height = height;
        this.unit = unit;
        this.bombCount = bombCount;
        this.safeCount = 0;
        this.opend = 0;
        this.gameover = false;
        this.gamewin = false;

        this.boxes = [];

        this.setupBoard([width, height], unit, bombCount);
    }

    setupBoard(boardSize, unit, bombCount) {
        const xCount = Math.floor(boardSize[0] / unit);
        const yCount = Math.floor(boardSize[1] / unit);
        const boxCount = xCount * yCount;
        this.safeCount = boxCount - bombCount;

        const numbers = Array.from({ length: boxCount }, (_, i) => i);
        const bombs = [];
        while (bombs.length < bombCount) {
            const idx = Math.floor(Math.random() * numbers.length);
            bombs.push(numbers.splice(idx, 1)[0]);
        }

        const lst = Array.from({ length: yCount }, () => Array(xCount).fill(0));
        for (const num of bombs) {
            lst[Math.floor(num / xCount)][num % xCount] = 1;
        }

        const boxGrid = [];

        for (let j = 0; j < yCount; j++) {
            const row = [];
            for (let i = 0; i < xCount; i++) {
                let bomb = lst[j][i];
                let neighbors = 0;

                const dirs = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [ 0, -1],          [ 0, 1],
                    [ 1, -1], [ 1, 0], [ 1, 1],
                ];

                for (const [dy, dx] of dirs) {
                    const ny = j + dy;
                    const nx = i + dx;
                    if (ny >= 0 && ny < yCount && nx >= 0 && nx < xCount) {
                        neighbors += lst[ny][nx];
                    }
                }

                const box = new Box(
                    [i * unit, j * unit],
                    bomb,
                    bomb ? null : neighbors,
                    false,
                    unit
                );

                row.push(box);
                this.boxes.push(box);
            }
            boxGrid.push(row);
        }

        for (let j = 0; j < yCount; j++) {
            for (let i = 0; i < xCount; i++) {
                const current = boxGrid[j][i];
                if (j > 0 && i > 0) current.topLeft = boxGrid[j - 1][i - 1];
                if (j > 0) current.top = boxGrid[j - 1][i];
                if (j > 0 && i < xCount - 1) current.topRight = boxGrid[j - 1][i + 1];
                if (i < xCount - 1) current.right = boxGrid[j][i + 1];
                if (j < yCount - 1 && i < xCount - 1) current.bottomRight = boxGrid[j + 1][i + 1];
                if (j < yCount - 1) current.bottom = boxGrid[j + 1][i];
                if (j < yCount - 1 && i > 0) current.bottomLeft = boxGrid[j + 1][i - 1];
                if (i > 0) current.left = boxGrid[j][i - 1];
            }
        }
    }

    click(x, y, ctx) {
        if (this.gameover || this.gamewin) return;

        for (const box of this.boxes) {
        if (box.contains(x, y)) {
            if (box.bomb) {
                box.color = "red";
                for (const b of this.boxes) {
                    if (b.bomb) b.show = true;
                }
                this.gameover = true;
            } else {
                this.opend += box.click();
                if (this.opend === this.safeCount) {
                    this.gamewin = true;
                }
            }
            this.draw(ctx);
            break;
        }
        }
    }

    draw(ctx) {
        for (const box of this.boxes) {
            box.draw(ctx);
        }

        if (this.gameover || this.gamewin) {
            ctx.fillStyle = "black";
            ctx.font = "80px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const message = this.gameover ? "Game Over!!" : "You Won!!";
            ctx.fillText(message, this.width / 2, this.height / 2);
        }
    }
}

const board = new Board(WIDTH, HEIGHT, UNIT, bombCount);

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    board.click(mouseX, mouseY, ctx);
});

function drawLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.draw(ctx);
    requestAnimationFrame(drawLoop);
}
drawLoop();