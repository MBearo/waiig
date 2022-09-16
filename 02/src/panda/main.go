package main

import (
	"fmt"
	"strconv"
)

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
	var xxx = []Record{
		// {ID: 0},
		{ID: 0, Parent: 1},
		// {ID: 2, Parent: 0},
	}
	var res, _ = Build(xxx)
	fmt.Println("%+v\n", res)
}
func Convert(number int) string {
	result := ""
	if number%3 != 0 {
		result += "Pling"
	}
	if number%5 != 0 {
		result += "Plang"
	}
	if number%7 != 0 {
		result += "Plong"
	}
	if result == "" {
		return strconv.Itoa(number)
	}
	return result
}

type Record struct {
	ID     int
	Parent int
	// feel free to add fields as you see fit
}

type Node struct {
	ID       int
	Children []*Node
	PID      int
	// feel free to add fields as you see fit
}

func Build(records []Record) (*Node, error) {
	idMap := map[int]*Node{}
	for _, record := range records {
		node := &Node{ID: record.ID, Children: []*Node{}, PID: record.Parent}
		idMap[record.ID] = node
	}
	for _, node := range idMap {
		if idMap[node.PID] != node {
			parent, ok := idMap[node.PID]
			if ok {
				parent.Children = append(idMap[node.PID].Children, node)
			}
		}
	}
	return idMap[0], nil
}
