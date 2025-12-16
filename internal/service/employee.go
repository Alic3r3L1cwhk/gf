package service

import (
	"github.com/gogf/gf-demo-user/v2/internal/dao"
	"github.com/gogf/gf-demo-user/v2/internal/model/entity"
)

type EmployeeService struct{}

var Employee = EmployeeService{}

func (s *EmployeeService) List() ([]*entity.Employee, error) {
	return dao.Employee.All()
}

func (s *EmployeeService) Get(id int64) (*entity.Employee, error) {
	return dao.Employee.GetById(id)
}

func (s *EmployeeService) Create(data *entity.Employee) (int64, error) {
	return dao.Employee.Create(data)
}

func (s *EmployeeService) Update(id int64, data *entity.Employee) error {
	return dao.Employee.Update(id, data)
}

func (s *EmployeeService) Delete(id int64) error {
	return dao.Employee.Delete(id)
}