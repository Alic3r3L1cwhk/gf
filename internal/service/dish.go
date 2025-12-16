package service

import (
	"github.com/gogf/gf-demo-user/v2/internal/dao"
	"github.com/gogf/gf-demo-user/v2/internal/model/entity"
)

type DishService struct{}

var Dish = DishService{}

func (s *DishService) List() ([]*entity.Dish, error) {
	return dao.Dish.All()
}

func (s *DishService) Get(id int64) (*entity.Dish, error) {
	return dao.Dish.GetById(id)
}

func (s *DishService) Create(data *entity.Dish) (int64, error) {
	return dao.Dish.Create(data)
}

func (s *DishService) Update(id int64, data *entity.Dish) error {
	return dao.Dish.Update(id, data)
}

func (s *DishService) Delete(id int64) error {
	return dao.Dish.Delete(id)
}