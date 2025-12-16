package dao

import (
	"github.com/gogf/gf-demo-user/v2/internal/model/entity"
	"github.com/gogf/gf/v2/frame/g"
)

type EmployeeDao struct {
	table string
}

var Employee = EmployeeDao{
	table: "employee",
}

func (d *EmployeeDao) All() ([]*entity.Employee, error) {
	var employees []*entity.Employee
	err := g.DB().Model(d.table).Scan(&employees)
	return employees, err
}

func (d *EmployeeDao) GetById(id int64) (*entity.Employee, error) {
	var employee entity.Employee
	err := g.DB().Model(d.table).Where("id", id).Scan(&employee)
	return &employee, err
}

func (d *EmployeeDao) Create(data *entity.Employee) (int64, error) {
	r, err := g.DB().Model(d.table).Data(data).Insert()
	if err != nil {
		return 0, err
	}
	id, err := r.LastInsertId()
	return id, err
}

func (d *EmployeeDao) Update(id int64, data *entity.Employee) error {
	_, err := g.DB().Model(d.table).Where("id", id).Data(data).Update()
	return err
}

func (d *EmployeeDao) Delete(id int64) error {
	_, err := g.DB().Model(d.table).Where("id", id).Delete()
	return err
}