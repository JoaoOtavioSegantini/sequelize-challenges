import { Sequelize } from "sequelize-typescript";
import CustomerFactory from "../../../domain/customer/factory/customer.factory";
import Address from "../../../domain/customer/value-object/address";
import CustomerModel from "../../../infrastructure/customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../infrastructure/customer/repository/sequelize/customer.repository";
import UpdateCustomerUseCase from "./update.customer.usecase";

describe("Test update customer use case", () => {
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

  it("should update a customer", async () => {
    const customerRepository = new CustomerRepository();
    const usecase = new UpdateCustomerUseCase(customerRepository);

    const address = new Address("Street", 123, "13330-250", "São Paulo");

    const customer = CustomerFactory.createWithAddress("John", address);

    await customerRepository.create(customer);

    const input = {
      id: customer.id,
      name: "John More",
      address: {
        street: "Street 2",
        city: "San Diego", 
        number: 1,
        zip: "052330-250",
      },
    };

    const output = {
      id: customer.id,
      name: "John More",
      address: {
        street: "Street 2",
        city: "San Diego",
        number: 1,
        zip: "052330-250",
      },
    };

    const result = await usecase.execute(input);

    expect(result).toEqual(output);
  });
});
