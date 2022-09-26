export enum TokenType {
    ILLEGAL = "ILLEGAL",
    EOF = "EOF",

    // Identifiers + literals
    IDENT = "IDENT", // add, foobar, x, y, ...
    INT = "INT",  // 1343456

    // Operators
    ASSIGN = "=",
    PLUS = "+",
    MINUS = "-",
    BANG = "!",
    ASTERISK = "*",
    SLASH = "/",

    LT = "<",
    GT = ">",

    EQ = "==",
    NOT_EQ = "!=",

    // Delimiters
    COMMA = ",",
    SEMICOLON = ";",

    LPAREN = "(",
    RPAREN = ")",
    LBRACE = "{",
    RBRACE = "}",

    // Keywords
    FUNCTION = "FUNCTION",
    LET = "LET",
    TRUE = "TRUE",
    FALSE = "FALSE",
    IF = "IF",
    ELSE = "ELSE",
    RETURN = "RETURN"
}

export interface Token {
    type: TokenType;
    literal: string;
}

export function newToken(tokenType: TokenType, ch: string): Token {
    return { type: tokenType, literal: ch };
}
const keywords = new Map([
    ["fn", TokenType.FUNCTION],
    ["let", TokenType.LET],
    ["true", TokenType.TRUE],
    ["false", TokenType.FALSE],
    ["if", TokenType.IF],
    ["else", TokenType.ELSE],
    ["return", TokenType.RETURN]
])

export function lookupIdent(ident: string): TokenType {
    const tok = keywords.get(ident);
    if (tok) {
        return tok;
    }
    return TokenType.IDENT;
}