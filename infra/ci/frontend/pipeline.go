package frontend

import (
	"context"

	"github.com/rboucheron/foliode-ci/fs"
	"github.com/rboucheron/foliode-ci/pipeline"
)

func Release(ctx context.Context) []pipeline.Step {
	return []pipeline.Step{
		{
			Name: "install frontend dependencies...",
			Run: func(_ context.Context) error {
				return pipeline.Run(ctx, "./frontend", "bun", "install")
			},
		},
		{
			Name: "test frontend with bun...",
			Run: func(_ context.Context) error {
				return pipeline.Run(ctx, "./frontend", "bun", "test")
			},
		},
		{
			Name: "build Next.js...",
			Run: func(_ context.Context) error {
				return pipeline.Run(ctx, "./frontend/website", "bun", "run", "build")
			},
		},
		{
			Name: "create release folder...",
			Run: func(_ context.Context) error {
				return fs.Create("./release/frontend")
			},
		},
		{
			Name: "copy frontend to release folder...",
			Run: func(_ context.Context) error {
				return fs.CopyDir("./frontend/website/.next", "./release/frontend")
			},
		},
	}
}

func Install(ctx context.Context) []pipeline.Step {
	return []pipeline.Step{
		{
			Name: "install frontend dependencies...",
			Run: func(_ context.Context) error {
				return pipeline.Run(ctx, "./frontend", "bun", "install")
			},
		},
	}
}