package service

import (
	"github.com/gogf/gf-demo-user/v2/internal/dao"
	"github.com/gogf/gf-demo-user/v2/internal/model/entity"
)

type OrderService struct{}

var Order = OrderService{}

func (s *OrderService) List() ([]*entity.Order, error) {
	return dao.Order.All()
}

func (s *OrderService) Get(id int64) (*entity.Order, error) {
	return dao.Order.GetById(id)
}

func (s *OrderService) Create(data *entity.Order) (int64, error) {
	return dao.Order.Create(data)
}

func (s *OrderService) Update(id int64, data *entity.Order) error {
	return dao.Order.Update(id, data)
}

func (s *OrderService) Delete(id int64) error {
	return dao.Order.Delete(id)
}

func (s *OrderService) Accept(id int64) error {
	return dao.Order.Accept(id)
}

func (s *OrderService) Complete(id int64) error {
	return dao.Order.Complete(id)
}

func (s *OrderService) Cancel(id int64, reason string) error {
	return dao.Order.Cancel(id, reason)
}
