import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import Product from "../../../../domain/product/entity/product";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }
  async update(entity: Order): Promise<void> {

    await OrderModel.update(
      { customer_id: entity.customerId, total: entity.total() },
      {
        where: {
          id: entity.id,
        },
      }
    ).then(async function () {
      await OrderItemModel.findAll({ where: {id: entity.id}}).then(async function (item) {
        item.map(async (newItem) => {
          await OrderItemModel.update(
            {
              name: newItem.name,
              price: newItem.price,
              product_id: newItem.product_id,
              quantity: newItem.quantity,
            },
            { where: { id: newItem.id } }
          );
        });
      });
    });
  }
  async find(id: string): Promise<Order> {
    let orderModel;
    try {
      orderModel = await OrderModel.findOne({
        include: [{ model: OrderItemModel }],
        where: {
          id,
        },
        rejectOnEmpty: true,
      });
    } catch (error) {
      throw new Error("Order not found");
    }


  const items =  orderModel.items.map((item) => {
     const newitem = new OrderItem(
        item.id,
        item.name,
        item.price / item.quantity,
        item.product_id,
        item.quantity
      );
      return newitem
    });
    const order = new Order(id, orderModel.customer_id, items);
    return order;
  }
  async findAll(): Promise<Order[]> {
    let orders: Order[] = [];

    try {
      const orderModels = await OrderModel.findAll({
        include: [{ model: OrderItemModel }],
      });
      orderModels.map((orderModel) => {
        let orderItems: OrderItem[] = [];

        orderItems = orderModel.items.map((item) => {
          const orderItem = new OrderItem(
            item.id,
            item.name,
            item.price / item.quantity,
            item.product_id,
            item.quantity
          );
          return orderItem;
        });

        const order = new Order(
          orderModel.id,
          orderModel.customer_id,
          orderItems
        );

        orders.push(order);
      });
    } catch (error) {
      console.log(error);
    }
    return orders;
  }
}
