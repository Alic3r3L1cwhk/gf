package controller

import (
	"github.com/gogf/gf-demo-user/v2/internal/model/entity"
	"github.com/gogf/gf-demo-user/v2/internal/service"
	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/net/ghttp"
)

type OrderController struct{}

var Order = OrderController{}

func (c *OrderController) Register(r *ghttp.RouterGroup) {
	r.GET("/orders", c.List)
	r.POST("/orders", c.Create)
	r.GET("/orders/:id", c.Get)
	r.PUT("/orders/:id", c.Update)
	r.DELETE("/orders/:id", c.Delete)

	// 订单操作接口
	r.POST("/orders/actions/accept/:id", c.Accept)
	r.POST("/orders/actions/complete/:id", c.Complete)
	r.POST("/orders/actions/cancel/:id", c.Cancel)
}

func (c *OrderController) List(r *ghttp.Request) {
	data, err := service.Order.List()
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "success", "data": data})
}

func (c *OrderController) Get(r *ghttp.Request) {
	id := r.Get("id").Int64()
	data, err := service.Order.Get(id)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "success", "data": data})
}

func (c *OrderController) Create(r *ghttp.Request) {
	var data entity.Order
	if err := r.Parse(&data); err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	id, err := service.Order.Create(&data)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "success", "data": g.Map{"id": id}})
}

func (c *OrderController) Update(r *ghttp.Request) {
	id := r.Get("id").Int64()
	var data entity.Order
	if err := r.Parse(&data); err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	err := service.Order.Update(id, &data)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "success", "data": nil})
}

func (c *OrderController) Delete(r *ghttp.Request) {
	id := r.Get("id").Int64()
	err := service.Order.Delete(id)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "success", "data": nil})
}

func (c *OrderController) Accept(r *ghttp.Request) {
	id := r.Get("id").Int64()
	err := service.Order.Accept(id)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "订单已接单", "data": nil})
}

func (c *OrderController) Complete(r *ghttp.Request) {
	id := r.Get("id").Int64()
	err := service.Order.Complete(id)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "订单已完成", "data": nil})
}

func (c *OrderController) Cancel(r *ghttp.Request) {
	id := r.Get("id").Int64()
	reason := r.Get("cancel_reason").String()
	err := service.Order.Cancel(id, reason)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "订单已取消", "data": nil})
}
