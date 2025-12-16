package cmd

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/net/ghttp"
	"github.com/gogf/gf/v2/net/goai"
	"github.com/gogf/gf/v2/os/gcmd"
	"github.com/gogf/gf/v2/os/gctx"

	"github.com/gogf/gf-demo-user/v2/internal/consts"
	"github.com/gogf/gf-demo-user/v2/internal/controller"
	"github.com/gogf/gf-demo-user/v2/internal/controller/user"
	"github.com/gogf/gf-demo-user/v2/internal/service"

	"github.com/goflyfox/gtoken/v2/gtoken"
)

var (
	// Main is the main command.
	Main = gcmd.Command{
		Name:  "main",
		Usage: "main",
		Brief: "start http server of simple goframe demos",
		Func: func(ctx context.Context, parser *gcmd.Parser) (err error) {
			s := g.Server()

			// 初始化gtoken
			gt := initGToken()
			gtokenMiddleware := gtoken.NewDefaultMiddleware(gt)

			// 设置AuthService中的GToken实例
			service.Auth.SetGToken(gt)

			s.Use(ghttp.MiddlewareHandlerResponse)
			s.Group("/", func(group *ghttp.RouterGroup) {
				// Group middlewares.
				group.Middleware(
					service.Middleware().Ctx,
					ghttp.MiddlewareCORS,
				)
				// Register route handlers.
				var (
					userCtrl = user.NewV1()
				)
				group.Bind(
					userCtrl,
				)

				// 注册新的控制器
				controller.Dish.Register(group)
				controller.Employee.Register(group)
				controller.Order.Register(group)
				controller.OrderDetail.Register(group)
				controller.Auth.Register(group)

				// Special handler that needs authentication.
				group.Group("/", func(group *ghttp.RouterGroup) {
					group.Middleware(service.Middleware().Auth)
					group.ALLMap(g.Map{
						"/user/profile": userCtrl.Profile,
					})
				})

				// 需要JWT认证的接口组
				group.Group("/api/v1", func(group *ghttp.RouterGroup) {
					// 使用gtoken中间件
					group.Middleware(gtokenMiddleware.Auth)
					controller.Dish.Register(group)
					controller.Employee.Register(group)
					controller.Order.Register(group)
					controller.OrderDetail.Register(group)
				})
			})
			// Custom enhance API document.
			enhanceOpenAPIDoc(s)
			// Just run the server.
			s.Run()
			return nil
		},
	}
)

// initGToken 初始化 gtoken
func initGToken() gtoken.Token {
	// 从 config.yaml 读取 gtoken 配置（假设配置在 gtoken 节点下）
	cfg := g.Cfg().MustGet(gctx.New(), "gtoken").MapStrVar()

	// 创建 GToken 实例
	gt := gtoken.NewDefaultToken(gtoken.Options{
		CacheMode:      cfg["cacheMode"].Int8(),
		CachePreKey:    cfg["cacheKey"].String(),
		Timeout:        cfg["timeout"].Int64(),    // 转换为毫秒
		MaxRefresh:     cfg["maxRefresh"].Int64(), // 转换为毫秒
		TokenDelimiter: cfg["tokenDelimiter"].String(),
		EncryptKey:     []byte(cfg["encryptKey"].String()),
		MultiLogin:     cfg["multiLogin"].Bool(),
	})

	return gt
}

func enhanceOpenAPIDoc(s *ghttp.Server) {
	openapi := s.GetOpenApi()
	openapi.Info.Title = consts.OpenAPITitle
	openapi.Info.Description = consts.OpenAPIDescription
	openapi.Config.CommonResponse = ghttp.DefaultHandlerResponse{}
	openapi.Config.CommonResponseDataField = `Data`

	// API description.
	openapi.Tags = &goai.Tags{
		goai.Tag{
			Name:        "Dish",
			Description: "菜品管理",
		},
		goai.Tag{
			Name:        "Employee",
			Description: "员工管理",
		},
		goai.Tag{
			Name:        "Order",
			Description: "订单管理",
		},
		goai.Tag{
			Name:        "OrderDetail",
			Description: "订单明细管理",
		},
		goai.Tag{
			Name:        "Auth",
			Description: "认证：注册、登录、密码重置",
		},
	}

	// Security.
	openapi.Components = goai.Components{
		SecuritySchemes: goai.SecuritySchemes{
			"Bearer": goai.SecuritySchemeRef{
				Value: &goai.SecurityScheme{
					Type:        "apiKey",
					Name:        "Authorization",
					In:          "header",
					Description: "JWT Token: Bearer <token>",
				},
			},
		},
	}
}
