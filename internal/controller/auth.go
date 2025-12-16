package controller

import (
	"strings"

	"github.com/gogf/gf-demo-user/v2/internal/service"
	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/net/ghttp"
)

type AuthController struct{}

var Auth = AuthController{}

func (c *AuthController) Register(r *ghttp.RouterGroup) {
	r.POST("/auth/register/send-code", c.SendRegisterCode)
	r.POST("/auth/register", c.RegisterEmployee)
	r.POST("/auth/login", c.Login)
	r.POST("/auth/password/reset/send-code", c.SendResetCode)
	r.POST("/auth/password/reset", c.ResetPassword)
}

// SendRegisterCode 发送注册验证码
func (c *AuthController) SendRegisterCode(r *ghttp.Request) {
	email := r.Get("email").String()
	if email == "" {
		r.Response.WriteJson(g.Map{"code": 1, "message": "邮箱不能为空"})
		return
	}

	err := service.Auth.SendRegisterCode(r.Context(), email)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error()})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "验证码已发送"})
}

// Register 员工注册
func (c *AuthController) RegisterEmployee(r *ghttp.Request) {
	var req struct {
		Email    string `json:"email" v:"required|email"`
		Password string `json:"password" v:"required|min-length:6"`
		Code     string `json:"code" v:"required|length:4,4"`
	}

	if err := r.Parse(&req); err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error()})
		return
	}

	id, err := service.Auth.Register(r.Context(), req.Email, req.Password, strings.TrimSpace(req.Code))
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error()})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "注册成功", "data": g.Map{"id": id, "email": req.Email}})
}

// Login 员工登录
func (c *AuthController) Login(r *ghttp.Request) {
	var req struct {
		Email    string `json:"email" v:"required|email"`
		Password string `json:"password" v:"required"`
	}

	if err := r.Parse(&req); err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error()})
		return
	}

	result, err := service.Auth.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error()})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "登录成功", "data": result})
}

// SendResetCode 发送密码重置验证码
func (c *AuthController) SendResetCode(r *ghttp.Request) {
	email := r.Get("email").String()
	if email == "" {
		r.Response.WriteJson(g.Map{"code": 1, "message": "邮箱不能为空"})
		return
	}

	err := service.Auth.SendResetCode(r.Context(), email)
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error()})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "验证码已发送"})
}

// ResetPassword 重置密码
func (c *AuthController) ResetPassword(r *ghttp.Request) {
	var req struct {
		Email       string `json:"email" v:"required|email"`
		NewPassword string `json:"new_password" v:"required|min-length:6"`
		Code        string `json:"code" v:"required|length:4,4"`
	}

	if err := r.Parse(&req); err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error()})
		return
	}

	err := service.Auth.ResetPassword(r.Context(), req.Email, req.NewPassword, strings.TrimSpace(req.Code))
	if err != nil {
		r.Response.WriteJson(g.Map{"code": 1, "message": err.Error()})
		return
	}
	r.Response.WriteJson(g.Map{"code": 0, "message": "密码重置成功"})
}
