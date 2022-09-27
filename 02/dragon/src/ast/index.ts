import { Token } from "../token";

export interface Node {
    tokenLiteral(): string;
    string(): string;
}
export interface Statement extends Node {
    statementNode(): void;
}
export interface Expression extends Node {
    expressionNode(): void;
}

export class Program implements Node {
    statements: Statement[] = [];
    constructor(props: { statements: Statement[] }) {
        this.statements = props.statements;
    }
    tokenLiteral(): string {
        if (this.statements.length > 0) {
            return this.statements[0].tokenLiteral();
        } else {
            return '';
        }
    }

    string(): string {
        return this.statements.map(stmt => stmt.string()).join('');
    }
}

export class LetStatement implements Statement {
    token: Token;
    name?: Identifier;
    value?: Expression;

    constructor({ token, name, value }: { token: Token, name?: Identifier, value?: Expression }) {
        this.token = token;
        if (name) {
            this.name = name;
        }
        if (value) {
            this.value = value;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    statementNode() { }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        let out = `${this.tokenLiteral()} ${this.name?.string()}`;
        if (this.value) {
            out += ` = ${this.value.string()}`;
        }
        out += ';';
        return out;
    }
}

export class Identifier implements Expression {
    token: Token;
    value: string;

    constructor({ token, value }: { token: Token; value: string }) {
        this.token = token;
        this.value = value
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expressionNode() { }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        return this.value;
    }
}

export class ReturnStatement implements Statement {
    token: Token;
    returnValue?: Expression;

    constructor({ token }: { token: Token }) {
        this.token = token;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    statementNode() { }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        let out = `${this.tokenLiteral()}`;
        if (this.returnValue) {
            out += ` ${this.returnValue.string()}`;
        }
        if (this.tokenLiteral() === ';') {
            out += this.tokenLiteral();
        }
        return out;
    }
}

// 这个和Expression有啥区别？
export class ExpressionStatement implements Statement {
    token: Token;
    expression?: Expression;

    constructor({ token, expression }: { token: Token, expression?: Expression }) {
        this.token = token;
        if (expression) {
            this.expression = expression;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    statementNode() { }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        if (this.expression) {
            return this.expression.string();
        }
        return '';
    }
}

export class IntegerLiteral implements Expression {
    token: Token;
    value: number;

    constructor({ token, value }: { token: Token; value: number }) {
        this.token = token;
        this.value = value;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expressionNode() { }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        return this.token.literal;
    }
}

export class PrefixExpression implements Expression {
    token: Token;
    operator: string;
    right?: Expression;

    constructor({ token, operator, right }: { token: Token; operator: string; right?: Expression }) {
        this.token = token;
        this.operator = operator;
        if (right) {
            this.right = right;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expressionNode() { }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        const out = `(${this.operator}${this.right?.string()})`;
        return out;
    }
}

export class InfixExpression implements Expression {
    token: Token;
    left?: Expression;
    operator: string;
    right?: Expression;

    constructor({ token, left, operator, right }: { token: Token; left?: Expression; operator: string; right?: Expression }) {
        this.token = token;
        if (left) {
            this.left = left;
        }
        this.operator = operator;
        if (right) {
            this.right = right;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expressionNode() { }

    tokenLiteral(): string {
        return this.token.literal;
    }

    string(): string {
        const out = `(${this.left?.string()} ${this.operator} ${this.right?.string()})`;
        return out;
    }
}