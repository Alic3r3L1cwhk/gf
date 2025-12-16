package service

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"github.com/gogf/gf-demo-user/v2/internal/dao"
	"github.com/gogf/gf/v2/errors/gerror"
	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/os/glog"
	"github.com/gogf/gf/v2/util/gconv"
	
	"github.com/goflyfox/gtoken/v2/gtoken"
	"github.com/jordan-wright/email"
	"net/smtp"
	"crypto/tls"
)

type AuthService struct{
	GToken gtoken.Token
}

var Auth = AuthService{}

// sendEmailCode 发送邮件验证码
func (s *AuthService) sendEmailCode(ctx context.Context, emailAddress, code, subject string) error {
	// 从配置文件获取SMTP配置
	smtpConfig := g.Cfg().MustGet(ctx, "smtp").MapStrStr()
	
	host := smtpConfig["host"]
	port := smtpConfig["port"]
	username := smtpConfig["username"]
	password := smtpConfig["password"]
	from := smtpConfig["from"]
	
	if host == "" || port == "" || username == "" || password == "" || from == "" {
		return gerror.New("SMTP配置不完整，请检查config.yaml中的smtp配置")
	}
	
	// 构造邮件内容
	e := email.NewEmail()
	e.From = fmt.Sprintf("验证码服务 <%s>", from)
	e.To = []string{emailAddress}
	e.Subject = subject
	e.Text = []byte(fmt.Sprintf("您的验证码是: %s (5分钟内有效)", code))
	
	// 发送邮件
	portInt := gconv.Int(port)
	
	// 对于465端口，使用SSL连接
	if portInt == 465 {
		return e.SendWithTLS(fmt.Sprintf("%s:%d", host, portInt), smtp.PlainAuth("", username, password, host), &tls.Config{
			ServerName: host,
		})
	}
	
	// 对于其他端口(如587)，使用StartTLS连接
	return e.SendWithStartTLS(fmt.Sprintf("%s:%d", host, portInt), smtp.PlainAuth("", username, password, host), &tls.Config{
		ServerName: host,
	})
}

// SetGToken 设置GToken实例
func (s *AuthService) SetGToken(gt gtoken.Token) {
	s.GToken = gt
}

// SendRegisterCode 发送注册验证码
func (s *AuthService) SendRegisterCode(ctx context.Context, email string) error {
	// 检查邮箱是否已经注册
	registered, err := dao.Auth.IsEmailRegistered(ctx, email)
	if err != nil {
		return err
	}
	if registered {
		return gerror.New("邮箱已被注册")
	}

	// 生成4位随机数字验证码
	rand.Seed(time.Now().UnixNano())
	code := fmt.Sprintf("%04d", rand.Intn(10000))
	glog.Debugf(ctx, "===================  code for email %s: %s   ===================", email, code)

	// 存储到Redis，5分钟过期
	err = g.Redis().SetEX(ctx, email, code, 5*60)
	if err != nil {
		return gerror.New("验证码发送失败")
	}

	// 发送邮件验证码
	err = s.sendEmailCode(ctx, email, code, "注册验证码")
	if err != nil {
		return gerror.Newf("发送验证码邮件失败: %v", err)
	}

	return nil
}

// Register 员工注册
func (s *AuthService) Register(ctx context.Context, email, password, code string) (int64, error) {
	// 验证码校验
	cacheCode, err := g.Redis().Get(ctx, email)
	if err != nil {
		return 0, gerror.New("系统错误")
	}
	if cacheCode.IsNil() {
		return 0, gerror.New("验证码已过期")
	}
	if cacheCode.String() != code {
		return 0, gerror.New("验证码错误")
	}

	// 检查邮箱是否已经注册
	registered, err := dao.Auth.IsEmailRegistered(ctx, email)
	if err != nil {
		return 0, err
	}
	if registered {
		return 0, gerror.New("邮箱已被注册")
	}

	// 直接使用明文密码
	// 插入数据库
	id, err := dao.Auth.RegisterEmployee(ctx, email, password)
	if err != nil {
		return 0, err
	}

	// 删除已使用的验证码
	_, err = g.Redis().Del(ctx, email)
	if err != nil {
		glog.Warning(ctx, "Failed to delete verification code:", err)
	}

	return id, nil
}

// Login 员工登录
func (s *AuthService) Login(ctx context.Context, email, password string) (map[string]interface{}, error) {
	// 直接使用明文密码查询
	employee, err := dao.Auth.GetEmployeeByEmailAndPassword(ctx, email, password)
	if err != nil {
		return nil, err
	}
	if employee == nil {
		return nil, gerror.New("邮箱或密码错误")
	}

	// 使用GToken生成真正的JWT token
	userKey := gconv.String(employee.Id)
	userData := g.Map{
		"id":       employee.Id,
		"name":     employee.Name,
		"username": employee.Username,
		"email":    employee.Email,
		"phone":    employee.Phone,
	}
	
	glog.Debugf(ctx, "Generating token for user: %s with data: %v", userKey, userData)
	token, err := s.GToken.Generate(ctx, userKey, userData)
	if err != nil {
		glog.Errorf(ctx, "Failed to generate token for user %s: %v", userKey, err)
		return nil, err
	}
	
	glog.Debugf(ctx, "Successfully generated token: %s", token)

	// 获取token的过期时间
	options := s.GToken.GetOptions()
	
	result := g.Map{
		"token":      token,
		"expires_in": options.Timeout,
		"user":       employee,
	}

	return result, nil
}

// SendResetCode 发送密码重置验证码
func (s *AuthService) SendResetCode(ctx context.Context, email string) error {
	// 检查邮箱是否存在
	registered, err := dao.Auth.IsEmailRegistered(ctx, email)
	if err != nil {
		return err
	}
	if !registered {
		return gerror.New("邮箱未注册")
	}

	// 生成4位随机数字验证码
	rand.Seed(time.Now().UnixNano())
	code := fmt.Sprintf("%04d", rand.Intn(10000))
	glog.Debugf(ctx, "===================   code for email %s: %s   ===================", email, code)

	// 存储到Redis，5分钟过期
	err = g.Redis().SetEX(ctx, "reset_"+email, code, 5*60)
	if err != nil {
		return gerror.New("验证码发送失败")
	}

	// 发送邮件验证码
	err = s.sendEmailCode(ctx, email, code, "密码重置验证码")
	if err != nil {
		return gerror.Newf("发送验证码邮件失败: %v", err)
	}

	return nil
}

// ResetPassword 重置密码
func (s *AuthService) ResetPassword(ctx context.Context, email, newPassword, code string) error {
	// 验证码校验
	cacheCode, err := g.Redis().Get(ctx, "reset_"+email)
	if err != nil {
		return gerror.New("系统错误")
	}
	if cacheCode.IsNil() {
		return gerror.New("验证码已过期")
	}
	if cacheCode.String() != code {
		return gerror.New("验证码错误")
	}

	// 检查邮箱是否存在
	registered, err := dao.Auth.IsEmailRegistered(ctx, email)
	if err != nil {
		return err
	}
	if !registered {
		return gerror.New("邮箱未注册")
	}

	// 直接使用明文密码更新
	err = dao.Auth.UpdatePassword(ctx, email, newPassword)
	if err != nil {
		return err
	}

	// 删除已使用的验证码
	_, err = g.Redis().Del(ctx, "reset_"+email)
	if err != nil {
		glog.Warning(ctx, "Failed to delete reset verification code:", err)
	}

	return nil
}