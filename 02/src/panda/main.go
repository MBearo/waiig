package main

import "fmt"

type Bar struct {
	value int
}
type Foo struct {
	bar   Bar
	value int
}

func trans(foo Foo) {
	foo.bar.value = 10
}

func main() {
	f := Foo{Bar{1}, 2}
	fmt.Println(f.value)
	fmt.Println(f.bar.value)
	trans(f)
	fmt.Println(f.value)
	fmt.Println(f.bar.value)
}
