package main

import "fmt"

var keys = map[string]int{
	"a": 1,
	"b": 2,
}

func main() {
	lll, xxx := keys["a"]
	fmt.Printf("xxx %v %v \n", lll, xxx)
}
