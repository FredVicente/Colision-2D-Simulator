const canva = document.querySelector(".myCanvas")
const ctx = canva.getContext("2d")

const energyLabel = document.querySelector('.energy')

canva.width = canva.clientWidth
canva.height = canva.clientHeight

const defaultRadius = 15
const qtd =50
const velocity = 12
let energy

const ballsList = []

document.querySelector(".restart-button").addEventListener("click", () => {
    window.location.reload()
})

window.addEventListener("load", () => {
    for(i = 0; i < qtd; i++){
        const mass = randomRangeInt(1, 4)
        const {x, y} = generatePositions(defaultRadius * mass)
        const vx = randomRangeInt(-velocity, velocity)
        const vy = randomRangeInt(-velocity, velocity)
        const color = randomColor()

        ballsList.push(new Ball(vx, vy, x, y, mass, color))
    }

    setInterval(() => {
        ctx.clearRect(0, 0, canva.width, canva.height)

        energy = 0

        for(const ball of ballsList){
            ball.update()

            energy += ball.mass * (Math.pow(ball.getVelocity(), 2))
        }

    }, 15)

})

// Colisao e velocidade
const handleCollision = (b1, b2) => {
    const x_diff = b2.x - b1.x
    const y_diff = b2.y - b1.y

    const vxDiff = b2.v.x - b1.v.x
    const vyDiff = b2.v.y - b1.v.y

    if(vxDiff * x_diff + vyDiff * y_diff < 0){
        const angle = -Math.atan2(y_diff, x_diff)
    
        // Troca os eixos para (N, T)
        const u1 = changeAxies(b1.v, angle)
        const u2 = changeAxies(b2.v, angle)

        const v1 = getFinalVelocity(u1, u2, b1.mass, b2.mass)
        const v2 = getFinalVelocity(u2, u1, b2.mass, b1.mass)

        // Troca os eixos para (x, y)
        const finalV1 = changeAxies(v1, -angle)
        const finalV2 = changeAxies(v2, -angle)

        b1.velocity = finalV1
        b2.velocity = finalV2
    }
}

const getFinalVelocity = (ui, uj, mi, mj) => {
    const vx = ui.x * (mi - mj) / (mi + mj) + uj.x * 2 * mj / (mi + mj)

    return {
        x: vx,
        y: ui.y
    }
}

// Troca os valores de velocidade para um novo eixo
const changeAxies = (vel, angle) => {
    const rotadedVel = {
        x: vel.x * Math.cos(angle) - vel.y * Math.sin(angle),
        y: vel.x * Math.sin(angle) + vel.y * Math.cos(angle),
    }

    return rotadedVel
}

// Classe das bolas, com todos os seus atributos

class Ball{
    constructor(vX, vY, initialX, initialY, mass, color){
        this.v = {
            x: vX * .5,
            y: vY * .5
        }
        this.x = initialX
        this.y = initialY
        this.radius = defaultRadius * mass
        this.mass = mass
        this.color = color
    }

    _incrementX = () => {
        if(this.x + this.radius >= canva.width || this.x - this.radius <= 0){
            this.v.x = this.v.x * -1
        }
        
        return this.x + this.v.x
    }

    _incrementY = () => {
        if(this.y + this.radius >= canva.height || this.y - this.radius <= 0){
            this.v.y = this.v.y * -1
        }
        
        return this.y + this.v.y
    }

    draw = () => {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    set velocity(vel){
        this.v = {
            x: vel.x,
            y: vel.y
        }
    }

    update = () => {
        this.draw()

        for(let ball of ballsList){
            if(this === ball) continue
            else{
                let dist = distance(this.x, this.y, ball.x, ball.y)

                if(dist - (this.radius + ball.radius) < 0){
                    handleCollision(this, ball)
                }
            }
        }

        this.x = this._incrementX()
        this.y = this._incrementY()
    }

    getVelocity = () => {
        return Math.sqrt(Math.pow(this.v.x, 2) + Math.pow(this.v.y, 2))
    }
}

/* Functions uteis */

// Gera posicoes aleatorias nao repetidas
const generatePositions = (radius) => {
    let x = randomRangeInt(radius * 1.5, canva.width - radius * 1.5)
    let y = randomRangeInt(radius * 1.5, canva.height -radius * 1.5)

    if(ballsList.length > 0){
        for(let i = 0; i < ballsList.length; i++){

            let dist = distance(x, y, ballsList[i].x, ballsList[i].y)
            let dif = dist - defaultRadius * 3

            if(dif <= 0){
                x = Math.floor(Math.random() * (canva.width - defaultRadius * 3) + defaultRadius)
                y = Math.floor(Math.random() * (canva.height - defaultRadius * 3) + defaultRadius)

                i = -1
            }
        }
    }

    return {x, y}
}

// Distancia entre os centros das bolas
const distance = (x1, y1, x2, y2) => {
    const distX = x2 - x1
    const distY = y2 - y1

    return Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2))
}

// Gera um numero inteiro constante entre um intervalo
const randomRangeInt = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min)
}

// Gera uma cor aleatória
function randomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    
    for (let i = 0; i < 6; i++) 
        color += letters[Math.floor(Math.random() * 16)];

    return color;
}