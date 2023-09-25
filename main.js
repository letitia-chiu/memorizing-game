////// Global Variables //////
// --- Materials //
const Symbols = [
  {name: 'spade', img: 'img/spade.png'},
  {name: 'heart', img: 'img/heart.png'},
  {name: 'diamond', img: 'img/diamond.png'},
  {name: 'club', img: 'img/club.png'}
]

// --- Game State //
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}


////// Function Sets //////
// --- Model //
const model = {
  revealedCards: [],
  score: 0,
  triedTimes: 0,

  // 判斷兩張卡片數字是否相同，並回傳布林值
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.number === this.revealedCards[1].dataset.number
  }
}

// --- Controller //
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardActions(card) {
    // 若卡片非牌向上，則不做動作
    if (!card.matches('.back')) {
      return
    }
    // 依照遊戲狀態進行動作
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCard(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCard(card)
        model.revealedCards.push(card)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          this.currentState = GAME_STATE.CardsMatched
          view.renderScore(model.score += 10)
          view.pairCards(model.revealedCards)
          model.revealedCards = []

          // 判斷是否完成遊戲
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }

          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
  },

  resetCards() {
    model.revealedCards.map((card) => { view.flipCard(card) })
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

// --- View //
const view = {
  transformNumber(number) {
    // 將數字 1, 11, 12, 13 轉換成 A, J, Q, K
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  getCardElement(index) {
    // 計算卡片數字
    const number = this.transformNumber((index % 13) + 1)

    // 計算卡片花色
    const symbol = Symbols[Math.floor(index / 13)]

    // 回傳卡片 html 元素
    return `
      <div class="card-base">
        <div class="card ${symbol.name} back" data-number="${number}">
          <p>${number}</p>
          <img src="${symbol.img}" alt="card">
          <p>${number}</p>
        </div>
      </div>
    `
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    const rawHTML = indexes.map((index) => this.getCardElement(index)).join('')
    rootElement.innerHTML = rawHTML
  },

  flipCard(card) {
    if (card.matches('.back')) {
      card.classList.remove('back')
    } else if (!card.matches('.back')) {
      card.classList.add('back')
    }
  },

  pairCards(cards) {
    cards.map((card) => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').innerText = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').innerText = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.parentElement.classList.add('wrong')
      card.parentElement.addEventListener('animationend', event => event.target.classList.remove('wrong'), {once: true})
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Congratulations!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('header')
    header.before(div)
  }
}

// --- Utility //
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}


////// Executing //////
// --- Generate Cards (Initialization)//
controller.generateCards()


////// Event Listeners //////
// --- Card Click Event //
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', event => {
    controller.dispatchCardActions(card)
  })
})