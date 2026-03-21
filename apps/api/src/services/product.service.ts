import { categoryRepository, itemRepository } from "../repositories";

export class ProductService {
    async getCategories() {
        return categoryRepository.findAllOrdered();
    }

    async getItemsByCategory(categoryId: string) {
        return itemRepository.findManyByCategory(categoryId);
    }

    async getItemById(categoryId: string, itemId: string) {
        return itemRepository.findByIdWithRelations(categoryId, itemId);
    }
}
