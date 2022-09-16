package lexer

import "dog/token"

type Lexer struct {
	input        string
	position     int
	readPosition int // 永远比positon大1，如果position到了最后，readPosition就是0
	ch           byte
}

func (l *Lexer) NextToken() token.Token {
	var tok token.Token
	l.skipWhitespace()
	switch l.ch {
	case '=':
		if l.peekChar() == '=' {
			l.readChar()
			tok = token.Token{Type: token.EQ, Literal: "=="} // 这么写不就完了
		} else {
			tok = newToken(token.ASSIGN, l.ch)
		}
	case '+':
		tok = newToken(token.PLUS, l.ch)
	case '-':
		tok = newToken(token.MINUS, l.ch)
	case '!':
		if l.peekChar() == '=' {
			l.readChar()
			tok = token.Token{Type: token.NOT_EQ, Literal: "!="}
		} else {
			tok = newToken(token.BANG, l.ch)
		}
	case '/':
		tok = newToken(token.SLASH, l.ch)
	case '*':
		tok = newToken(token.ASTERISK, l.ch)
	case '<':
		tok = newToken(token.LT, l.ch)
	case '>':
		tok = newToken(token.GT, l.ch)
	case ';':
		tok = newToken(token.SEMICOLON, l.ch)
	case ',':
		tok = newToken(token.COMMA, l.ch)
	case '{':
		tok = newToken(token.LBRACE, l.ch)
	case '}':
		tok = newToken(token.RBRACE, l.ch)
	case '(':
		tok = newToken(token.LPAREN, l.ch)
	case ')':
		tok = newToken(token.RPAREN, l.ch)
	case 0: // readChar 到头了
		return token.Token{Type: token.EOF, Literal: ""} // 应该不用再执行readchar了吧
	default:
		// 有可能是keyword 有可能是 identifier
		if isLetter(l.ch) {
			literal := l.readIdentifier()
			if token.LookupIdent(literal) == token.IDENT {
				return token.Token{Type: token.IDENT, Literal: literal}
			} else {
				return token.Token{Type: token.LookupIdent(literal), Literal: literal}
			}
		} else if isDigit(l.ch) {
			return token.Token{Type: token.INT, Literal: l.readNumber()}
		} else {
			return token.Token{Type: token.ILLEGAL, Literal: string(l.ch)}
		}
	}
	l.readChar()
	return tok
}

// 这里得用引用了，不然不会改变原来的值
// 调用这个实际会往前走一步
func (l *Lexer) readChar() {
	if l.readPosition >= len(l.input) {
		l.ch = 0
	} else {
		l.ch = l.input[l.readPosition]
	}
	l.position = l.readPosition
	l.readPosition += 1
}

// 为啥叫这个名字，let 也不是 identifier 把
func (l *Lexer) readIdentifier() string {
	position := l.position
	for isLetter(l.ch) {
		l.readChar()
	}
	return l.input[position:l.position]
}

func (l *Lexer) readNumber() string {
	position := l.position
	for isDigit(l.ch) {
		l.readChar()
	}
	return l.input[position:l.position]
}

func (l *Lexer) skipWhitespace() {
	for l.ch == ' ' || l.ch == '\t' || l.ch == '\n' || l.ch == '\r' {
		l.readChar()
	}
}

func (l *Lexer) peekChar() byte {
	if l.readPosition >= len(l.input) {
		return 0
	} else {
		return l.input[l.readPosition]
	}
}

func New(input string) *Lexer {
	// 这里不用引用行么？
	l := &Lexer{input: input}
	l.readChar()
	return l
}

// byte类型可以做比较，有意思
func isLetter(ch byte) bool {
	return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || ch == '_'
}
func isDigit(ch byte) bool {
	return '0' <= ch && ch <= '9'
}
func newToken(tokenType token.TokenType, ch byte) token.Token {
	return token.Token{Type: tokenType, Literal: string(ch)}
}
