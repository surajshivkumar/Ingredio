export interface PaginationParams {
    cursor?: string;
}

export interface PaginationMeta {
    nextCursor: string | null;
    hasMore: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationMeta;
}
