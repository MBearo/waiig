import { Lexer } from "./lexer";
import { TokenType } from "./token";

console.log('start');
const a = 10;

const input = `=+(){},;`;
const l = new Lexer(input);

const tests = [
    { expectedType: TokenType.ASSIGN, expectedLiteral: '=' },
    { expectedType: TokenType.PLUS, expectedLiteral: '+' },
    { expectedType: TokenType.LPAREN, expectedLiteral: '(' },
    { expectedType: TokenType.RPAREN, expectedLiteral: ')' },
    { expectedType: TokenType.LBRACE, expectedLiteral: '{' },
    { expectedType: TokenType.RBRACE, expectedLiteral: '}' },
    { expectedType: TokenType.COMMA, expectedLiteral: ',' },
    { expectedType: TokenType.SEMICOLON, expectedLiteral: ';' },
    { expectedType: TokenType.EOF, expectedLiteral: '' },
];
tests.forEach(tt => {
    const tok = l.nextToken();
    console.log(tok.type, tt.expectedType)
    console.log(tok.literal, tt.expectedLiteral)
})
export default a;