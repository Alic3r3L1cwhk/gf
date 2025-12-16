package controller

import (
	"github.com/gogf/gf-demo-user/v2/internal/model/entity"
	"github.com/gogf/gf-demo-user/v2/internal/service"
	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/net/ghttp"
)

type EmployeeController struct{}

var Employee = EmployeeController{}

func (c *EmployeeController) Register(r *ghttp.RouterGroup) {
	r.GET("/employees", c.List)
	r.POST("/employees", c.Create)
	r.GET("/employees/:id", c.Get)
	r.PUT("/employees/:id", c.Update)
	r.DELETE("/employees/:id", c.Delete)
}

func (c *EmployeeController) List(r *ghttp.Request) {
	data, err := service.Employee.List()
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "success", "data": data})
}

func (c *EmployeeController) Get(r *ghttp.Request) {
	id := r.Get("id").Int64()
	data, err := service.Employee.Get(id)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "success", "data": data})
}

func (c *EmployeeController) Create(r *ghttp.Request) {
	var data entity.Employee
	if err := r.Parse(&data); err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	id, err := service.Employee.Create(&data)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "success", "data": g.Map{"id": id}})
}

func (c *EmployeeController) Update(r *ghttp.Request) {
	id := r.Get("id").Int64()
	var data entity.Employee
	if err := r.Parse(&data); err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	err := service.Employee.Update(id, &data)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "success", "data": nil})
}

func (c *EmployeeController) Delete(r *ghttp.Request) {
	id := r.Get("id").Int64()
	err := service.Employee.Delete(id)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error(), "data": nil})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "success", "data": nil})
}
