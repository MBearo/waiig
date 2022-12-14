import { describe, expect, test } from '@jest/globals';
import {
    Expression,
    ExpressionStatement,
    Identifier,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    PrefixExpression,
    Boolean,
    IfExpression,
    FunctionLiteral,
    CallExpression,
    Statement
} from '../ast';
import { Lexer } from '../lexer';
import { Parser } from '../parser';

describe('parser', () => {
    test('test let statement', () => {
        const test =[{
            input: 'let x = 5;',
            expectedIdentifier: 'x',
            expectedValue: 5
        }, {
            input: 'let y = true;',
            
            expectedIdentifier: 'y',
            expectedValue: true
        }, {
            input: 'let foobar = y;',
            expectedIdentifier: 'foobar',
            expectedValue: 'y'
        }];
        test.forEach((tt) => {
            const l = new Lexer(tt.input);
            const p = new Parser(l);
            const program = p.parseProgram();
            checkParserErrors(p);
            expect(program.statements.length).toBe(1);
            const stmt = program.statements[0];
            testLetStatement(stmt, tt.expectedIdentifier);
            const val = (stmt as LetStatement).value;
            testLiteralExpression(val as Expression, tt.expectedValue);
        });
    });

    test('test return statement', () => {
        const input = `
            return 5;
            return 10;
            return 993322;
        `;
        const l = new Lexer(input);
        const p = new Parser(l);
        checkParserErrors(p);
        const program = p.parseProgram();
        expect(program).not.toBeNull();
        expect(program.statements.length).toBe(3);
        program.statements.forEach((stmt) => {
            expect(stmt.tokenLiteral()).toBe('return');
        });
    });

    test('test identifier expression', () => {
        const input = 'foobar;';
        const l = new Lexer(input);
        const p = new Parser(l);
        checkParserErrors(p);
        const program = p.parseProgram();
        expect(program).not.toBeNull();
        expect(program.statements.length).toBe(1);
        const stmt = program.statements[0];
        expect(stmt.tokenLiteral()).toBe('foobar');
    });

    test('test integer literal expression', () => {
        const input = '5;';
        const l = new Lexer(input);
        const p = new Parser(l);
        checkParserErrors(p);
        const program = p.parseProgram();
        expect(program).not.toBeNull();
        expect(program.statements.length).toBe(1);
        const stmt = program.statements[0];
        expect(stmt.tokenLiteral()).toBe('5');
    });

    test('test parsing prefix expressions', () => {
        const prefixTests = [
            { input: '!5;', operator: '!', value: 5 },
            { input: '-15;', operator: '-', value: 15 },
            // { input: '!true;', operator: '!', value: true },
            // { input: '!false;', operator: '!', value: false },
        ];
        prefixTests.forEach((tt) => {
            const l = new Lexer(tt.input);
            const p = new Parser(l);
            checkParserErrors(p);
            const program = p.parseProgram();
            console.log('program', program)
            expect(program).not.toBeNull();
            expect(program.statements.length).toBe(1);
            const stmt = program.statements[0] as ExpressionStatement;
            expect(stmt.tokenLiteral()).toBe(tt.operator);
            const exp = stmt.expression as PrefixExpression;
            expect(exp).not.toBeNull();
            expect(exp?.operator).toBe(tt.operator);
            testIntegerLiteral(exp?.right as IntegerLiteral, tt.value);
        });
    })

    test('test parsing infix expressions', () => {
        const infixTests = [
            { input: '5 + 5;', leftValue: 5, operator: '+', rightValue: 5 },
            { input: '5 - 5;', leftValue: 5, operator: '-', rightValue: 5 },
            { input: '5 * 5;', leftValue: 5, operator: '*', rightValue: 5 },
            { input: '5 / 5;', leftValue: 5, operator: '/', rightValue: 5 },
            { input: '5 > 5;', leftValue: 5, operator: '>', rightValue: 5 },
            { input: '5 < 5;', leftValue: 5, operator: '<', rightValue: 5 },
            { input: '5 == 5;', leftValue: 5, operator: '==', rightValue: 5 },
            { input: '5 != 5;', leftValue: 5, operator: '!=', rightValue: 5 },
            { input: 'true == true', leftValue: true, operator: '==', rightValue: true },
            { input: 'true != false', leftValue: true, operator: '!=', rightValue: false },
            { input: 'false == false', leftValue: false, operator: '==', rightValue: false },
        ];
        infixTests.forEach((tt) => {
            const l = new Lexer(tt.input);
            const p = new Parser(l);
            checkParserErrors(p);
            const program = p.parseProgram();
            expect(program).not.toBeNull();
            expect(program.statements.length).toBe(1);
            const stmt = program.statements[0] as ExpressionStatement;
            const exp = stmt.expression;
            testInfixExpression(exp as InfixExpression, tt.leftValue, tt.operator, tt.rightValue);
        });
    })

    test('test operator precedence parsing', () => {
        const tests = [
            { input: '-a * b', expected: '((-a) * b)' },
            { input: '!-a', expected: '(!(-a))' },
            { input: 'a + b + c', expected: '((a + b) + c)' },
            { input: 'a + b - c', expected: '((a + b) - c)' },
            { input: 'a * b * c', expected: '((a * b) * c)' },
            { input: 'a * b / c', expected: '((a * b) / c)' },
            { input: 'a + b / c', expected: '(a + (b / c))' },
            { input: 'a + b * c + d / e - f', expected: '(((a + (b * c)) + (d / e)) - f)' },
            { input: '3 + 4; -5 * 5', expected: '(3 + 4)((-5) * 5)' },
            { input: '5 > 4 == 3 < 4', expected: '((5 > 4) == (3 < 4))' },
            { input: '5 < 4 != 3 > 4', expected: '((5 < 4) != (3 > 4))' },
            { input: '3 + 4 * 5 == 3 * 1 + 4 * 5', expected: '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))' },
            { input: 'true', expected: 'true' },
            { input: 'false', expected: 'false' },
            { input: '3 > 5 == false', expected: '((3 > 5) == false)' },
            { input: '3 < 5 == true', expected: '((3 < 5) == true)' },
            { input: '1 + (2 + 3) + 4', expected: '((1 + (2 + 3)) + 4)' },
            { input: '(5 + 5) * 2', expected: '((5 + 5) * 2)' },
            { input: '2 / (5 + 5)', expected: '(2 / (5 + 5))' },
            { input: '(5 + 5) * 2 * (5 + 5)', expected: '(((5 + 5) * 2) * (5 + 5))' },
            { input: '-(5 + 5)', expected: '(-(5 + 5))' },
            { input: '!(true == true)', expected: '(!(true == true))' },
            { input: 'a + add(b * c) + d', expected: '((a + add((b * c))) + d)' },
            { input: 'add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))', expected: 'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))' },
            { input: 'add(a + b + c * d / f + g)', expected: 'add((((a + b) + ((c * d) / f)) + g))' },
        ]
        tests.forEach(tt => {
            const l = new Lexer(tt.input)
            const p = new Parser(l)
            checkParserErrors(p)
            const program = p.parseProgram()
            const actual = program.statements.map(stmt => stmt.string()).reduce((acc, cur) => acc + cur, '')
            console.log('actual', actual)
            expect(actual).toBe(tt.expected)
        })
    })

    test('test if expression', () => {
        const input = 'if (x < y) { x }'
        const l = new Lexer(input)
        const p = new Parser(l)
        checkParserErrors(p)
        const program = p.parseProgram()
        console.log('program', program)
        expect(program.statements.length).toBe(1)
        const stmt = program.statements[0] as ExpressionStatement
        const exp = stmt.expression as IfExpression
        console.log('exp',exp)
        expect(exp).not.toBeNull()
        testInfixExpression(exp.condition as InfixExpression, 'x', '<', 'y')
        expect(exp?.consequence?.statements.length).toBe(1)
        const consequence = exp?.consequence?.statements[0] as ExpressionStatement
        testIdentifier(consequence.expression as Identifier, 'x')
        expect(exp.alternative).toBeUndefined()
    })

    test('test if else expression', () => {
        const input = 'if (x < y) { x } else { y }'
        const l = new Lexer(input)
        const p = new Parser(l)
        checkParserErrors(p)
        const program = p.parseProgram()
        console.log('program', program)
        expect(program.statements.length).toBe(1)
        const stmt = program.statements[0] as ExpressionStatement
        const exp = stmt.expression as IfExpression
        expect(exp).not.toBeNull()
        testInfixExpression(exp.condition as InfixExpression, 'x', '<', 'y')
        expect(exp?.consequence?.statements.length).toBe(1)
        const consequence = exp?.consequence?.statements[0] as ExpressionStatement
        testIdentifier(consequence.expression as Identifier, 'x')
        expect(exp.alternative?.statements.length).toBe(1)
        const alternative = exp.alternative?.statements[0] as ExpressionStatement
        testIdentifier(alternative.expression as Identifier, 'y')
    })

    test('test function literal parsing', () => {
        const input = 'fn(x, y) { x + y; }'
        const l = new Lexer(input)
        const p = new Parser(l)
        checkParserErrors(p)
        const program = p.parseProgram()
        console.log('program', program)
        expect(program.statements.length).toBe(1)
        const stmt = program.statements[0] as ExpressionStatement
        const functionLiteral = stmt.expression as FunctionLiteral
        expect(functionLiteral.parameters.length).toBe(2)
        testLiteralExpression(functionLiteral.parameters[0], 'x')
        testLiteralExpression(functionLiteral.parameters[1], 'y')
        expect(functionLiteral?.body?.statements.length).toBe(1)
        const bodyStmt = functionLiteral?.body?.statements[0] as ExpressionStatement
        testInfixExpression(bodyStmt.expression as InfixExpression, 'x', '+', 'y')
    })

    test('test function parameter parsing', () => {
        const tests = [
            { input: 'fn() {};', expectedParams: [] },
            { input: 'fn(x) {};', expectedParams: ['x'] },
            { input: 'fn(x, y, z) {};', expectedParams: ['x', 'y', 'z'] },
        ]
        tests.forEach(tt => {
            const l = new Lexer(tt.input)
            const p = new Parser(l)
            checkParserErrors(p)
            const program = p.parseProgram()
            console.log('program', program)
            expect(program.statements.length).toBe(1)
            const stmt = program.statements[0] as ExpressionStatement
            const functionLiteral = stmt.expression as FunctionLiteral
            expect(functionLiteral.parameters.length).toBe(tt.expectedParams.length)
            tt.expectedParams.forEach((ident, i) => {
                testLiteralExpression(functionLiteral.parameters[i], ident)
            })
        })
    })

    test('test call expression parsing', () => {
        const input = 'add(1, 2 * 3, 4 + 5);'
        const l = new Lexer(input)
        const p = new Parser(l)
        checkParserErrors(p)
        const program = p.parseProgram()
        console.log('program', program)
        expect(program.statements.length).toBe(1)
        const stmt = program.statements[0] as ExpressionStatement
        const exp = stmt.expression as CallExpression
        testIdentifier(exp.function as Identifier, 'add')
        expect(exp.arguments.length).toBe(3)
        testLiteralExpression(exp.arguments[0], 1)
        testInfixExpression(exp.arguments[1] as InfixExpression, 2, '*', 3)
        testInfixExpression(exp.arguments[2] as InfixExpression, 4, '+', 5)
    })

})

function checkParserErrors(p: Parser) {
    const errors = p.errors;
    if (errors.length === 0) {
        return;
    }
    console.log('parser has', errors.length, 'errors');
    errors.forEach((msg) => {
        console.log('parser error:', msg);
    });
    throw new Error('parser has errors');
}

function testIntegerLiteral(il: IntegerLiteral, value: number) {
    expect(il.value).toBe(value);
    expect(il.tokenLiteral()).toBe(value.toString());
}

function testIdentifier(exp: Identifier, value: string) {
    expect(exp.value).toBe(value)
    expect(exp.tokenLiteral()).toBe(value)
}

function testLiteralExpression(exp: Expression, expected: any) {
    switch (typeof expected) {
        case 'number':
            testIntegerLiteral(exp as IntegerLiteral, expected);
            break;
        case 'string':
            testIdentifier(exp as Identifier, expected);
            break;
        case 'boolean':
            // eslint-disable-next-line @typescript-eslint/ban-types
            testBooleanLiteral(exp as Boolean, expected);
            break;
        default:
            throw new Error(`type of exp not handled. got=${typeof expected}`);
    }
}

function testInfixExpression(exp: InfixExpression, left: any, operator: string, right: any) {
    testLiteralExpression(exp.left as Expression, left);
    expect(exp.operator).toBe(operator);
    testLiteralExpression(exp.right as Expression, right);
}

// eslint-disable-next-line @typescript-eslint/ban-types
function testBooleanLiteral(bl: Boolean, value: boolean) {
    expect(bl.value).toBe(value);
    expect(bl.tokenLiteral()).toBe(value.toString());
}

function testLetStatement (stmt: Statement, name: string) {
    expect(stmt.tokenLiteral()).toBe('let');
    const letStmt = stmt as LetStatement;
    expect(letStmt?.name?.value).toBe(name);
    expect(letStmt?.name?.tokenLiteral()).toBe(name);
}