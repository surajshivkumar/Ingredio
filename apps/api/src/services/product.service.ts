import { categoryRepository, itemRepository } from "../repositories";
import { PaginationParams, PaginatedResponse } from "../types/pagination";

export class ProductService {
    async getCategories() {
        return categoryRepository.findAllOrdered();
    }

    async getItemsByCategory(categoryId: string, pagination: PaginationParams): Promise<PaginatedResponse<any>> {
        return itemRepository.findManyByCategory(categoryId, pagination);
    }

    async getItemById(categoryId: string, itemId: string) {
        return itemRepository.findByIdWithRelations(categoryId, itemId);
    }
}
