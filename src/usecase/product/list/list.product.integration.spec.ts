import { Sequelize } from "sequelize-typescript";
import Product from "../../../domain/product/entity/product";
import ProductModel from "../../../infrastructure/product/repository/sequelize/product.model";
import ProductRepository from "../../../infrastructure/product/repository/sequelize/product.repository";
import ListProductUseCase from "./list.product.usecase";

describe("Test list product use case", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([ProductModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should list a product", async () => {
    const productRepository = new ProductRepository();
    const usecase = new ListProductUseCase(productRepository);

    const product = new Product("123", "Product 1", 50);
    const product2 = new Product("456", "Product 2", 10);

    await productRepository.create(product);
    await productRepository.create(product2);

    const input = {};

    const output = {
      products: [
        { id: product.id, name: product.name, price: product.price },
        { id: product2.id, name: product2.name, price: product2.price },
      ],
    };

    const result = await usecase.execute(input);

    expect(result).toEqual(output);
  });
});
