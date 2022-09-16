package ast

import "dog/token"

// 这里不明白，为啥用interface
type Node interface {
	TokenLiteral() string // 仅用于调试
}

type Statement interface {
	Node
	statementNode()
}

type Experssion interface {
	Node
	expressionNode()
}

type Program struct {
	Statements []Statement // 是一个一维数组？
}

// 为啥给 Program 实现 TokenLiteral，原来 Program 也是一个 Node
func (p *Program) TokenLiteral() string {
	if len(p.Statements) > 0 {
		return p.Statements[0].TokenLiteral()
	} else {
		return ""
	}
}

// LetStatement 和 Identifier 都得有一个 token
type LetStatement struct {
	Token token.Token
	Name  *Identifier // ? 这为啥是个指针
	Value Experssion  // ? 这个 Experssion 是个 interface 啊？为啥
}

func (ls *LetStatement) statementNode() {}
func (ls *LetStatement) TokenLiteral() string {
	return ls.Token.Literal
}

type Identifier struct {
	Token token.Token // token.IDENT token
	Value string
}

// 只能通过 方法 来确定 Identifier 是一个 Experssion 么？
func (i *Identifier) expressionNode() {}
func (i *Identifier) TokenLiteral() string {
	return i.Token.Literal
}
