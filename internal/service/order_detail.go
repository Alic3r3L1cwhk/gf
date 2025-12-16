package service

import (
	"github.com/gogf/gf-demo-user/v2/internal/dao"
	"github.com/gogf/gf-demo-user/v2/internal/model/entity"
)

type OrderDetailService struct{}

var OrderDetail = OrderDetailService{}

func (s *OrderDetailService) GetByOrderId(orderId int64) ([]*entity.OrderDetail, error) {
	return dao.OrderDetail.GetByOrderId(orderId)
}

func (s *OrderDetailService) Create(data *entity.OrderDetail) (int64, error) {
	return dao.OrderDetail.Create(data)
}