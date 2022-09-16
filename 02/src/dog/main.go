package main

type Lexer struct {
	input        string
	position     int
	readPosition int
	ch           byte
}

// func (l Lexer) NextToken() token.Token{

// }

func New(input string) Lexer {
	// 这里不用引用行么？
	l := Lexer{input: input}
	l.input = "xxxxx"
	return l
}
func main() {
	l := New("hello")

	println(l.input)
}
