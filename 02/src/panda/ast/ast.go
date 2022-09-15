package ast

type Node interface {
	TokenLiteral() string // 大写开头，可以被其他包访问
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
	Statements []Statement
}
