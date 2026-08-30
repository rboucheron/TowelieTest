package pipeline

import (
	"context"
)

type Step struct {
	Name string
	Run  func(context.Context) error
}
