package dao

import (
	"github.com/gogf/gf-demo-user/v2/internal/model/entity"
	"github.com/gogf/gf/v2/frame/g"
)

type OrderDetailDao struct {
	table string
}

var OrderDetail = OrderDetailDao{
	table: "order_detail",
}

func (d *OrderDetailDao) GetByOrderId(orderId int64) ([]*entity.OrderDetail, error) {
	var details []*entity.OrderDetail
	err := g.DB().Model(d.table).Where("order_id", orderId).Scan(&details)
	return details, err
}

func (d *OrderDetailDao) Create(data *entity.OrderDetail) (int64, error) {
	r, err := g.DB().Model(d.table).Data(data).Insert()
	if err != nil {
		return 0, err
	}
	id, err := r.LastInsertId()
	return id, err
}