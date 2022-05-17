import { Sequelize } from "sequelize-typescript";
import CustomerFactory from "../../../domain/customer/factory/customer.factory";
import Address from "../../../domain/customer/value-object/address";
import CustomerModel from "../../../infrastructure/customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../infrastructure/customer/repository/sequelize/customer.repository";
import CreateCustomerUseCase from "./create.customer.usecase";

describe("Test create customer use case", () => {
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

  it("should create a customer", async () => {
    const customerRepository = new CustomerRepository();
    const usecase = new CreateCustomerUseCase(customerRepository);

    const address = new Address("Street", 123, "13330-250", "São Paulo");

    const customer = CustomerFactory.createWithAddress("John", address);
    await customerRepository.create(customer);

    const input = {
      name: "John",
      address: {
        street: "Street",
        city: "São Paulo",
        number: 123,
        zip: "13330-250",
      },
    };

    const result = await usecase.execute(input);

    const output = {
      id: result.id,
      name: "John",
      address: {
        street: "Street",
        city: "São Paulo",
        number: 123,
        zip: "13330-250",
      },
    };

    expect(result).toEqual(output);
  });
});
