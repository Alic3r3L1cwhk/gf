package dao

import (
	"context"
	"github.com/gogf/gf/v2/os/gtime"

	"github.com/gogf/gf-demo-user/v2/internal/model/entity"
	"github.com/gogf/gf/v2/frame/g"
)

type OrderDao struct {
	table string
}

var Order = OrderDao{
	table: "orders",
}

func (d *OrderDao) All() ([]*entity.Order, error) {
	var orders []*entity.Order
	err := g.DB().Model(d.table).Scan(&orders)
	return orders, err
}

func (d *OrderDao) GetById(id int64) (*entity.Order, error) {
	var order entity.Order
	err := g.DB().Model(d.table).Where("id", id).Scan(&order)
	return &order, err
}

func (d *OrderDao) Create(data *entity.Order) (int64, error) {
	r, err := g.DB().Model(d.table).Data(data).Insert()
	if err != nil {
		return 0, err
	}
	id, err := r.LastInsertId()
	return id, err
}

func (d *OrderDao) Update(id int64, data *entity.Order) error {
	_, err := g.DB().Model(d.table).Where("id", id).Data(data).Update()
	return err
}

func (d *OrderDao) Delete(id int64) error {
	// 开启事务
	ctx := context.Background()
	tx, err := g.DB().Begin(ctx)
	if err != nil {
		return err
	}

	// 先删除订单详情
	_, err = tx.Model("order_detail").Where("order_id", id).Delete()
	if err != nil {
		tx.Rollback()
		return err
	}

	// 再删除订单
	_, err = tx.Model(d.table).Where("id", id).Delete()
	if err != nil {
		tx.Rollback()
		return err
	}

	// 提交事务
	return tx.Commit()
}

func (d *OrderDao) Accept(id int64) error {
	data := g.Map{
		"status": 3, // 已接单
	}
	_, err := g.DB().Model(d.table).Where("id", id).Data(data).Update()
	return err
}

func (d *OrderDao) Complete(id int64) error {
	data := g.Map{
		"status": 4, // 已完成
	}
	_, err := g.DB().Model(d.table).Where("id", id).Data(data).Update()
	return err
}

func (d *OrderDao) Cancel(id int64, reason string) error {
	data := g.Map{
		"status":        5, // 已取消
		"cancel_reason": reason,
		"cancel_time":   gtime.Now(),
	}
	_, err := g.DB().Model(d.table).Where("id", id).Data(data).Update()
	return err
}