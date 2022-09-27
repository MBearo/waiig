import { describe, expect, test } from '@jest/globals';
import { LetStatement, Program } from '../ast';
import { TokenType } from '../token';
import { Identifier } from '../ast'

describe('ast', () => {
    test('test string', () => {
        const program = new Program({
            statements: [
                new LetStatement({
                    token: {
                        type: TokenType.LET,
                        literal: 'let'
                    },
                    name: new Identifier({
                        token: {
                            type: TokenType.IDENT,
                            literal: 'myVar'
                        },
                        value: 'myVar'
                    }),
                    value: new Identifier({
                        token: {
                            type: TokenType.IDENT,
                            literal: 'anotherVar'
                        },
                        value: 'anotherVar'
                    })
                })
            ]
        })

        expect(program.string()).toBe('let myVar = anotherVar;');
    })
})