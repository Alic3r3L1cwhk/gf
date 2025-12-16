package controller

import (
	"github.com/gogf/gf-demo-user/v2/internal/model/entity"
	"github.com/gogf/gf-demo-user/v2/internal/service"
	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/net/ghttp"
)

type OrderDetailController struct{}

var OrderDetail = OrderDetailController{}

func (c *OrderDetailController) Register(r *ghttp.RouterGroup) {
	// 订单明细接口
	r.GET("/orders/details/:orderId", c.Details)
	r.POST("/orders/details/create", c.CreateDetail)
}

func (c *OrderDetailController) Details(r *ghttp.Request) {
	orderId := r.Get("orderId").Int64()
	data, err := service.OrderDetail.GetByOrderId(orderId)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "success", "data": data})
}

func (c *OrderDetailController) CreateDetail(r *ghttp.Request) {
	var data entity.OrderDetail
	if err := r.Parse(&data); err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	id, err := service.OrderDetail.Create(&data)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "success", "data": g.Map{"id": id}})
}