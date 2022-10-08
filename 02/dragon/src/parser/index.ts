import {
    ExpressionStatement,
    Identifier,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    PrefixExpression,
    ReturnStatement,
    Boolean,
    IfExpression,
    BlockStatement,
    FunctionLiteral,
    CallExpression
} from "../ast";
import type { Expression, Statement } from '../ast'
import { Lexer } from "../lexer";
import { Token, TokenType } from "../token";

type PrefixParseFn = () => Expression;
type InfixParseFn = (left: Expression) => Expression;

enum Precedence {
    LOWEST,
    EQUALS, // ==
    LESSGREATER, // > or <
    SUM, // +
    PRODUCT, // *
    PREFIX, // -X or !X
    CALL, // myFunction(X)
}
const precedences = new Map([
    [TokenType.EQ, Precedence.EQUALS],
    [TokenType.NOT_EQ, Precedence.EQUALS],
    [TokenType.LT, Precedence.LESSGREATER],
    [TokenType.GT, Precedence.LESSGREATER],
    [TokenType.PLUS, Precedence.SUM],
    [TokenType.MINUS, Precedence.SUM],
    [TokenType.SLASH, Precedence.PRODUCT],
    [TokenType.ASTERISK, Precedence.PRODUCT],
    [TokenType.LPAREN, Precedence.CALL],
]);
export class Parser {
    l: Lexer;
    errors: string[] = [];

    curToken?: Token;
    peekToken?: Token;

    statements: Statement[] = [];

    prefixParseFns: Partial<Record<TokenType, PrefixParseFn>> = {};
    infixParseFns: Partial<Record<TokenType, InfixParseFn>> = {};

    constructor(l: Lexer) {
        this.l = l;
        this.nextToken();
        this.nextToken();

        // 这里给个常量不行么，还要动态注册，我不理解
        this.registerPrefix(TokenType.IDENT, this.parseIdentifier);
        this.registerPrefix(TokenType.INT, this.parseIntegerLiteral);
        this.registerPrefix(TokenType.BANG, this.parsePrefixExpression);
        this.registerPrefix(TokenType.MINUS, this.parsePrefixExpression);
        this.registerPrefix(TokenType.TRUE, this.parseBoolean);
        this.registerPrefix(TokenType.FALSE, this.parseBoolean);
        this.registerPrefix(TokenType.LPAREN, this.parseGroupedExpression);
        this.registerPrefix(TokenType.IF, this.parseIfExpression)
        this.registerPrefix(TokenType.FUNCTION, this.parseFunctionLiteral)

        this.registerInfix(TokenType.PLUS, this.parseInfixExpression);
        this.registerInfix(TokenType.MINUS, this.parseInfixExpression);
        this.registerInfix(TokenType.SLASH, this.parseInfixExpression);
        this.registerInfix(TokenType.ASTERISK, this.parseInfixExpression);
        this.registerInfix(TokenType.EQ, this.parseInfixExpression);
        this.registerInfix(TokenType.NOT_EQ, this.parseInfixExpression);
        this.registerInfix(TokenType.LT, this.parseInfixExpression);
        this.registerInfix(TokenType.GT, this.parseInfixExpression);
        this.registerInfix(TokenType.LPAREN, this.parseCallExpression);
    }

    nextToken() {
        this.curToken = this.peekToken;
        this.peekToken = this.l.nextToken();
    }

    parseProgram() {
        while (this.curToken?.type !== TokenType.EOF) {
            const stmt = this.parseStatement();
            if (stmt) {
                this.statements.push(stmt);
            }
            this.nextToken();
        }
        return this;
    }

    parseStatement() {
        switch (this.curToken?.type) {
            case TokenType.LET:
                return this.parseLetStatement();
            case TokenType.RETURN:
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    parseLetStatement() {
        const stmt = new LetStatement({
            token: this.curToken as Token
        });
        if (!this.expectPeek(TokenType.IDENT)) {
            return null;
        }
        stmt.name = new Identifier({
            token: this.curToken as Token,
            value: this.curToken?.literal as string
        });
        if (!this.expectPeek(TokenType.ASSIGN)) {
            return null;
        }
        this.nextToken();
        stmt.value = this.parseExpression(Precedence.LOWEST);
        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }
        return stmt;
    }

    parseReturnStatement() {
        const stmt = new ReturnStatement({
            token: this.curToken as Token
        });
        this.nextToken();
        stmt.returnValue = this.parseExpression(Precedence.LOWEST);
        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }
        return stmt;
    }

    parseExpressionStatement() {
        const stmt = new ExpressionStatement({
            token: this.curToken as Token,
            expression: this.parseExpression(Precedence.LOWEST)
        });
        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }
        return stmt;
    }
    // ! 核心算法
    parseExpression(precedence: Precedence): Expression {
        const prefix = this.prefixParseFns[this.curToken?.type as TokenType];
        if (!prefix) {
            console.log(precedence)
            this.noPrefixParseFnError(this.curToken?.type as TokenType);
            return null as any;
        }

        let leftExp = prefix.call(this);
        // precedence < this.peekPrecedence() 判断优先级
        while (!this.peekTokenIs(TokenType.SEMICOLON) && precedence < this.peekPrecedence()) {
            // 这个 peek 感觉很关键
            const infix = this.infixParseFns[this.peekToken?.type as TokenType];
            if (!infix) {
                return leftExp;
            }
            this.nextToken();
            // 调用 infx 会再 nextToken 一下
            leftExp = infix.call(this, leftExp);
        }
        return leftExp
    }

    parseIdentifier() {
        return new Identifier({
            token: this.curToken as Token,
            value: this.curToken?.literal as string
        });
    }

    parseIntegerLiteral() {
        const lit = new IntegerLiteral({
            token: this.curToken as Token,
            value: parseInt(this.curToken?.literal as string)
        });
        return lit;
    }

    parsePrefixExpression() {
        const expression = new PrefixExpression({
            token: this.curToken as Token,
            operator: this.curToken?.literal as string
        });
        this.nextToken();
        expression.right = this.parseExpression(Precedence.PREFIX);
        return expression;
    }

    parseInfixExpression(left: Expression) {
        const expression = new InfixExpression({
            token: this.curToken as Token,
            operator: this.curToken?.literal as string,
            left
        });
        const precedence = this.curPrecedence();
        this.nextToken();
        // ! 妙蛙种子他妈给妙蛙种子开门
        expression.right = this.parseExpression(precedence);
        return expression;
    }

    parseBoolean() {
        return new Boolean({
            token: this.curToken as Token,
            value: this.curTokenIs(TokenType.TRUE)
        });
    }

    parseGroupedExpression() {
        this.nextToken();
        const exp = this.parseExpression(Precedence.LOWEST);
        // TODO 这里咋处理呢
        if (!this.expectPeek(TokenType.RPAREN)) {
            return null as any;
        }
        return exp;
    }

    parseIfExpression() {
        const expression = new IfExpression({
            token: this.curToken as Token
        });
        if (!this.expectPeek(TokenType.LPAREN)) {
            return null as any;
        }
        this.nextToken();
        expression.condition = this.parseExpression(Precedence.LOWEST);
        if (!this.expectPeek(TokenType.RPAREN)) {
            return null as any;
        }
        if (!this.expectPeek(TokenType.LBRACE)) {
            return null as any;
        }
        expression.consequence = this.parseBlockStatement();
        if (this.peekTokenIs(TokenType.ELSE)) {
            this.nextToken();
            if (!this.expectPeek(TokenType.LBRACE)) {
                return null as any;
            }
            expression.alternative = this.parseBlockStatement();
        }
        return expression;
    }

    parseBlockStatement() {
        const block = new BlockStatement({
            token: this.curToken as Token,
            statements: []
        });
        this.nextToken();
        while (!this.curTokenIs(TokenType.RBRACE) && !this.curTokenIs(TokenType.EOF)) {
            const stmt = this.parseStatement();
            if (stmt) {
                block.statements.push(stmt);
            }
            this.nextToken();
        }
        return block;
    }

    parseFunctionLiteral() {
        const lit = new FunctionLiteral({
            token: this.curToken as Token,
            parameters: []
        });
        if (!this.expectPeek(TokenType.LPAREN)) {
            return null as any;
        }
        lit.parameters = this.parseFunctionParameters();
        if (!this.expectPeek(TokenType.LBRACE)) {
            return null as any;
        }
        lit.body = this.parseBlockStatement();
        return lit;
    }

    parseFunctionParameters() {
        const identifiers: Identifier[] = [];
        if (this.peekTokenIs(TokenType.RPAREN)) {
            this.nextToken();
            return identifiers;
        }
        this.nextToken();
        const ident = new Identifier({
            token: this.curToken as Token,
            value: this.curToken?.literal as string
        });
        identifiers.push(ident);
        while (this.peekTokenIs(TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();
            const ident = new Identifier({
                token: this.curToken as Token,
                value: this.curToken?.literal as string
            });
            identifiers.push(ident);
        }
        if (!this.expectPeek(TokenType.RPAREN)) {
            return null as any;
        }
        return identifiers;
    }

    parseCallExpression(functionName: Expression) {
        const exp = new CallExpression({
            token: this.curToken as Token,
            function: functionName,
            arguments: []
        });
        exp.arguments = this.parseCallArguments();
        return exp;
    }

    parseCallArguments() {
        const args: Expression[] = [];
        if (this.peekTokenIs(TokenType.RPAREN)) {
            this.nextToken();
            return args;
        }
        this.nextToken();
        args.push(this.parseExpression(Precedence.LOWEST));
        while (this.peekTokenIs(TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();
            args.push(this.parseExpression(Precedence.LOWEST));
        }
        if (!this.expectPeek(TokenType.RPAREN)) {
            return null as any;
        }
        return args;
    }

    expectPeek(t: TokenType) {
        if (this.peekTokenIs(t)) {
            this.nextToken();
            return true;
        } else {
            this.peekError(t);
            return false;
        }
    }

    peekTokenIs(t: TokenType) {
        return this.peekToken?.type === t;
    }

    curTokenIs(t: TokenType) {
        return this.curToken?.type === t;
    }

    getErrors() {
        return this.errors;
    }

    // todo 这名字起的不太好，pushError更好
    // 看下来peek的意思是”下一个“，不是”瞟一眼“
    peekError(t: TokenType) {
        const msg = `expected next token to be ${t}, got ${this.peekToken?.type} instead`;
        this.errors.push(msg);
    }

    noPrefixParseFnError(t: TokenType) {
        const msg = `no prefix parse function for ${t} found`;
        this.errors.push(msg);
    }

    registerPrefix(tokenType: TokenType, fn: PrefixParseFn) {
        this.prefixParseFns[tokenType] = fn;
    }

    registerInfix(tokenType: TokenType, fn: InfixParseFn) {
        this.infixParseFns[tokenType] = fn;
    }

    peekPrecedence() {
        return precedences.get(this.peekToken?.type as TokenType) || Precedence.LOWEST;
    }

    curPrecedence() {
        return precedences.get(this.curToken?.type as TokenType) || Precedence.LOWEST;
    }
}