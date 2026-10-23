export interface IQuery {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';

    searchTerm?: string;

    plantId?: string;
}
