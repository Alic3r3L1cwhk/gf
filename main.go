package main

import (
	_ "github.com/gogf/gf/contrib/drivers/mysql/v2"
	_ "github.com/gogf/gf/contrib/nosql/redis/v2"  // 添加Redis适配器

	_ "github.com/gogf/gf-demo-user/v2/internal/logic" // 添加这一行来触发logic包的初始化

	"github.com/gogf/gf/v2/os/gctx"

	"github.com/gogf/gf-demo-user/v2/internal/cmd"
)

func main() {
	cmd.Main.Run(gctx.GetInitCtx())
}