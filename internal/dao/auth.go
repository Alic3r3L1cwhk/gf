package dao

import (
	"context"

	"github.com/gogf/gf-demo-user/v2/internal/model/entity"
	"github.com/gogf/gf/v2/frame/g"
)

type AuthDao struct {
	table string
}

var Auth = AuthDao{
	table: "employee",
}

// IsEmailRegistered 检查邮箱是否已经注册
func (d *AuthDao) IsEmailRegistered(ctx context.Context, email string) (bool, error) {
	count, err := g.DB().Model(d.table).Where("email", email).Count()
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// RegisterEmployee 注册新员工
func (d *AuthDao) RegisterEmployee(ctx context.Context, email, password string) (int64, error) {
	r, err := g.DB().Model(d.table).Data(g.Map{
		"name":     email,
		"username": email,
		"password": password,
		"email":    email,
		"phone":    "",
	}).Insert()
	if err != nil {
		return 0, err
	}
	
	id, err := r.LastInsertId()
	if err != nil {
		return 0, err
	}
	
	return id, nil
}

// GetEmployeeByEmailAndPassword 根据邮箱和密码获取员工
func (d *AuthDao) GetEmployeeByEmailAndPassword(ctx context.Context, email, password string) (*entity.Employee, error) {
	var employee *entity.Employee
	err := g.DB().Model(d.table).Where(g.Map{
		"email":    email,
		"password": password,
	}).Scan(&employee)
	if err != nil {
		return nil, err
	}
	return employee, nil
}

// UpdatePassword 更新员工密码
func (d *AuthDao) UpdatePassword(ctx context.Context, email, newPassword string) error {
	_, err := g.DB().Model(d.table).Data(g.Map{
		"password": newPassword,
	}).Where("email", email).Update()
	return err
}