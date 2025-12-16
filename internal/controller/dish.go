package controller

import (
	"github.com/gogf/gf-demo-user/v2/internal/model/entity"
	"github.com/gogf/gf-demo-user/v2/internal/service"
	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/net/ghttp"
)

type DishController struct{}

var Dish = DishController{}

func (c *DishController) Register(r *ghttp.RouterGroup) {
	r.GET("/dishes", c.List)
	r.POST("/dishes", c.Create)
	r.GET("/dishes/:id", c.Get)
	r.PUT("/dishes/:id", c.Update)
	r.DELETE("/dishes/:id", c.Delete)
}

func (c *DishController) List(r *ghttp.Request) {
	data, err := service.Dish.List()
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "success", "data": data})
}

func (c *DishController) Get(r *ghttp.Request) {
	id := r.Get("id").Int64()
	data, err := service.Dish.Get(id)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "success", "data": data})
}

func (c *DishController) Create(r *ghttp.Request) {
	var data entity.Dish
	if err := r.Parse(&data); err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	id, err := service.Dish.Create(&data)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteStatus(201, g.Map{"code": 0, "message": "success", "data": g.Map{"id": id}})
}

func (c *DishController) Update(r *ghttp.Request) {
	id := r.Get("id").Int64()
	var data entity.Dish
	if err := r.Parse(&data); err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	err := service.Dish.Update(id, &data)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "success", "data": nil})
}

func (c *DishController) Delete(r *ghttp.Request) {
	id := r.Get("id").Int64()
	err := service.Dish.Delete(id)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "success", "data": nil})
}
