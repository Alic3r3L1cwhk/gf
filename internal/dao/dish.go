package dao

import (
	"github.com/gogf/gf-demo-user/v2/internal/model/entity"
	"github.com/gogf/gf/v2/frame/g"
)

type DishDao struct {
	table string
}

var Dish = DishDao{
	table: "dish",
}

func (d *DishDao) All() ([]*entity.Dish, error) {
	var dishes []*entity.Dish
	err := g.DB().Model(d.table).Scan(&dishes)
	return dishes, err
}

func (d *DishDao) GetById(id int64) (*entity.Dish, error) {
	var dish entity.Dish
	err := g.DB().Model(d.table).Where("id", id).Scan(&dish)
	return &dish, err
}

func (d *DishDao) Create(data *entity.Dish) (int64, error) {
	r, err := g.DB().Model(d.table).Data(data).Insert()
	if err != nil {
		return 0, err
	}
	id, err := r.LastInsertId()
	return id, err
}

func (d *DishDao) Update(id int64, data *entity.Dish) error {
	_, err := g.DB().Model(d.table).Where("id", id).Data(data).Update()
	return err
}

func (d *DishDao) Delete(id int64) error {
	_, err := g.DB().Model(d.table).Where("id", id).Delete()
	return err
}