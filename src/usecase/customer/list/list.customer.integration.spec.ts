import { Sequelize } from "sequelize-typescript";
import CustomerFactory from "../../../domain/customer/factory/customer.factory";
import Address from "../../../domain/customer/value-object/address";
import CustomerModel from "../../../infrastructure/customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../infrastructure/customer/repository/sequelize/customer.repository";
import ListCustomerUseCase from "./list.customer.usecase";

describe("Test list customer use case", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([CustomerModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should list a customer", async () => {
    const customerRepository = new CustomerRepository();
    const usecase = new ListCustomerUseCase(customerRepository);

    const address = new Address("Street", 123, "13330-250", "São Paulo");

    const customer = CustomerFactory.createWithAddress("John", address);
    const customer2 = CustomerFactory.createWithAddress("Ashley", address);

    await customerRepository.create(customer);
    await customerRepository.create(customer2);

    const input = {};

    const output = {
      customers: [
        {
          id: customer.id,
          name: "John",
          address: {
            street: "Street",
            city: "São Paulo",
            number: 123,
            zip: "13330-250",
          },
        },
        {
          id: customer2.id,
          name: "Ashley",
          address: {
            street: "Street",
            city: "São Paulo",
            number: 123,
            zip: "13330-250",
          },
        },
      ],
    };

    const result = await usecase.execute(input);

    expect(result).toEqual(output);
  });
});
