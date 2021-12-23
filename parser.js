const priorityAddSub = 0
const priorityMulDiv = 1

function add(a,b) {
  return a+b
}

function sub(a,b) {
  return a-b
}

function mul(a,b) {
  return a*b
}

function div(a,b) {
  return a/b
}

class Token{
  constructor(type,text,priority){
    this.type = type
    this.text = text
    this.priority = priority
  }

  value(){
    return Number(this.text)
  }
}

class AstNode {
  constructor(left,symbol,right) {
    this.left = left
    this.symbol = symbol
    this.right = right
  }

  value(){
    switch (this.symbol.type) {
      case AddSymbol.type:
        return add(this.left.value(),this.right.value())
      case SubSymbol.type:
        return sub(this.left.value(),this.right.value())
      case MulSymbol.type:
        return mul(this.left.value(),this.right.value())
      case DivSymbol.type:
        return div(this.left.value(),this.right.value())
      default:
        throw ("unknown symbol: "+this.symbol.type)
    }
  }
}

const  Numberic = new Token(1,"number",)
const  StringType=new Token(2,"string")
const  AddSymbol=new Token(3,"+",priorityAddSub)
const  SubSymbol=new Token(4,"-",priorityAddSub)
const  MulSymbol=new Token(5,"*",priorityMulDiv)
const  DivSymbol=new Token(6,"/",priorityMulDiv)
const  LeftParenthesisSymbol=new Token(7,"(")
const  RightParenthesisSymbol = new Token(8,")")

class Lexer {
  constructor(code) {
    this.code = code;
    this.position = 0
    this.readPosition = 0;
    this.length = code.length
    this.ch = 0

    console.log(this.code)
  }

  parser(){
    let tokens = []
    let token = this.nextToken()
    while(token){
      tokens.push(token)
      token = this.nextToken()
    }

    return tokens
  }

  readNumberic(){
    let ch = this.readNextCh()
    let position = this.position
    while(ch !== 0){
      if (!this.isNumber(ch)) {
        break
      }
      this.position = this.readPosition
      this.readPosition++
      ch = this.readNextCh()
    }

    return new Token(Numberic.type, this.code.substring(position,this.readPosition))
  }

  readCh(){
    if (this.readPosition < this.length){
      this.ch = this.code.charCodeAt(this.readPosition)
    }else{
      this.ch = 0
    }
    this.position = this.readPosition
    this.readPosition++
  }

  readNextCh(){
    if (this.readPosition < this.length){
      return this.code.charCodeAt(this.readPosition)
    }else{
      return 0
    }
  }

  isNumber(ch){
    return ch >=48 && ch <= 57
  }

  nextToken(){
    this.skipSpace()
    this.readCh()

    if (this.ch === 0){
      return null
    }
    if (this.isNumber(this.ch)) {
      return this.readNumberic()
    }

    switch (String.fromCharCode(this.ch)) {
      case AddSymbol.text:
        return AddSymbol
      case SubSymbol.text:
        return SubSymbol
      case MulSymbol.text:
        return MulSymbol
      case DivSymbol.text:
        return DivSymbol
      case LeftParenthesisSymbol.text:
        return LeftParenthesisSymbol
      case RightParenthesisSymbol.text:
        return RightParenthesisSymbol
      default:
        throw "invalid char: "
    }

  }

  skipSpace(){
    while(true){
      switch (String.fromCharCode(this.readNextCh())){
        case " ":
          this.readCh()
          break
        default:
          return
      }
    }
  }
}

class Parser{
  constructor(tokens) {
    this.tokens = tokens
    this.position = 0
    this.readPosition = 0
    this.length = tokens.length
    this.Expressions = []
  }

  readToken(){
    let token = this.tokens[this.readPosition]
    this.position = this.readPosition
    this.readPosition++
    return token
  }
  peek(){
    if (this.readPosition < this.length){
      return this.tokens[this.readPosition]
    }

    return null
  }

  readMulExpression(){}
  parser(){
    return this.nextExpression()
  }

  backOff(){
    this.position --
    this.readPosition --
  }

  nextExpression(){
    if (this.readPosition >= this.length){
      return null
    }
    let token = this.readToken()
    let number,nextNumber,nextSymbol;
    switch (token.type) {
      case Numberic.type:
        let symbol = this.peek()
        if (symbol === null) {
          return token
        }
        this.readToken()

        number = this.peek()
        if (number === null) {
          throw "invalid express"
        }
        this.readToken()

        nextSymbol = this.peek()
        if (nextSymbol === null) {
          return new AstNode(token, symbol, number)
        }

        if (symbol.priority < nextSymbol.priority) {
          this.backOff()
          return new AstNode(
            token,
            symbol,
            this.nextExpression()
          )
        }

        this.Expressions.push(new AstNode(token, symbol, number))
        return this.nextExpression()
      case AddSymbol.type:
      case SubSymbol.type:
      case MulSymbol.type:
      case DivSymbol.type:
        let left = this.Expressions.pop()
        number = this.peek()
        if (number === null){
          throw "invalid expression"
        }
        this.readToken()
        nextSymbol = this.peek()
        if (nextSymbol === null){
          return new AstNode(left,token,number)
        }
        if (token.priority < nextSymbol.priority ){
          this.backOff()
          return new AstNode(left,token,this.nextExpression())
        }

        this.Expressions.push(new AstNode(left, token, number))
        return this.nextExpression()

      default:
        throw "invalid express"
    }
  }
}
