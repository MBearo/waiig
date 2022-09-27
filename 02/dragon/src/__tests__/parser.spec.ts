import { describe, expect, test } from '@jest/globals';
import { ExpressionStatement, InfixExpression, IntegerLiteral, LetStatement, PrefixExpression } from '../ast';
import { Lexer } from '../lexer';
import { Parser } from '../parser';

describe('parser', () => {
    test('test let statement', () => {
        const input = `
            let x = 5;
            let y = 10;
            let foobar = 838383;
        `;
        const l = new Lexer(input);
        const p = new Parser(l);
        checkParserErrors(p);
        const program = p.parseProgram();
        expect(program).not.toBeNull();
        expect(program.statements.length).toBe(3);
        const tests = [
            { expectedIdentifier: 'x' },
            { expectedIdentifier: 'y' },
            { expectedIdentifier: 'foobar' },
        ];
        tests.forEach((tt, i) => {
            const stmt = program.statements[i];
            expect(stmt.tokenLiteral()).toBe('let');
            expect(stmt instanceof LetStatement).toBeTruthy();
            const letStmt = stmt as LetStatement;
            expect(letStmt?.name?.value).toBe(tt.expectedIdentifier);
            expect(letStmt?.name?.tokenLiteral()).toBe(tt.expectedIdentifier);
        });
        console.log('first statement', program);
        if (program.errors.length > 0) {
            console.log(program.errors);
        }
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
        ];
        infixTests.forEach((tt) => {
            const l = new Lexer(tt.input);
            const p = new Parser(l);
            checkParserErrors(p);
            const program = p.parseProgram();
            expect(program).not.toBeNull();
            expect(program.statements.length).toBe(1);
            const stmt = program.statements[0] as ExpressionStatement;
            const exp = stmt.expression as InfixExpression;
            testIntegerLiteral(exp?.left as IntegerLiteral, tt.leftValue);
            expect(exp?.operator).toBe(tt.operator);
            testIntegerLiteral(exp?.right as IntegerLiteral, tt.rightValue);
        });
    })

    test('test operator precedence parsing', () => {
        const tests = [
            { input: '-a * b', expected: '((-a) * b)' },
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