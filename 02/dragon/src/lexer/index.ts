import { lookupIdent, newToken, Token, TokenType } from "../token";

export class Lexer {
    input = '';
    position = 0;
    readPosition = 0;
    ch = '';

    constructor(input: string) {
        this.input = input;
        this.readChar();
    }

    readChar() {
        if (this.readPosition >= this.input.length) {
            this.ch = '';
        } else {
            this.ch = this.input[this.readPosition];
        }
        this.position = this.readPosition;
        this.readPosition += 1;
    }

    nextToken(): Token {
        let tok: Token;

        this.skipWhitespace();

        switch (this.ch) {
            case '=':
                if (this.peekChar() === '=') {
                    const ch = this.ch;
                    this.readChar();
                    const literal = ch + this.ch;
                    tok = newToken(TokenType.EQ, literal);
                } else {
                    tok = newToken(TokenType.ASSIGN, this.ch);
                }
                break;
            case '+':
                tok = newToken(TokenType.PLUS, this.ch);
                break;
            case '-':
                tok = newToken(TokenType.MINUS, this.ch);
                break;
            case '!':
                if (this.peekChar() === '=') {
                    const ch = this.ch;
                    this.readChar();
                    const literal = ch + this.ch;
                    tok = newToken(TokenType.NOT_EQ, literal);
                } else {
                    tok = newToken(TokenType.BANG, this.ch);
                }
                break;
            case '*':
                tok = newToken(TokenType.ASTERISK, this.ch);
                break;
            case '/':
                tok = newToken(TokenType.SLASH, this.ch);
                break;
            case '<':
                tok = newToken(TokenType.LT, this.ch);
                break;
            case '>':
                tok = newToken(TokenType.GT, this.ch);
                break;
            case ';':
                tok = newToken(TokenType.SEMICOLON, this.ch);
                break;
            case '(':
                tok = newToken(TokenType.LPAREN, this.ch);
                break;
            case ')':
                tok = newToken(TokenType.RPAREN, this.ch);
                break;
            case ',':
                tok = newToken(TokenType.COMMA, this.ch);
                break;
            case '{':
                tok = newToken(TokenType.LBRACE, this.ch);
                break;
            case '}':
                tok = newToken(TokenType.RBRACE, this.ch);
                break;
            case '':
                tok = newToken(TokenType.EOF, '');
                break;
            default:
                if (isLetter(this.ch)) {
                    const literal = this.readIdentifier();
                    const type = lookupIdent(literal);
                    return newToken(type, literal);
                } else if (isDigit(this.ch)) {
                    return newToken(TokenType.INT, this.readNumber());
                } else {
                    tok = newToken(TokenType.ILLEGAL, this.ch);
                }
        }

        this.readChar();
        return tok;
    }

    skipWhitespace() {
        while (this.ch === ' ' || this.ch === '\t' || this.ch === '\n' || this.ch === '\r') {
            this.readChar();
        }
    }

    readIdentifier() {
        const position = this.position;
        while (isLetter(this.ch)) {
            this.readChar();
        }
        return this.input.slice(position, this.position);
    }

    readNumber() {
        const position = this.position
        while (isDigit(this.ch)) {
            this.readChar();
        }
        return this.input.slice(position, this.position);
    }

    peekChar() {
        if (this.readPosition >= this.input.length) {
            return '';
        } else {
            return this.input[this.readPosition];
        }
    }
}

function isLetter(ch: string) {
    return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || ch === '_';
}

function isDigit(ch: string) {
    return '0' <= ch && ch <= '9';
}