export interface IQuery {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';

    searchTerm?: string;

    plantId?: string;
}


export type IMachine = {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    searchTerm?: string;
    plantId?: string;
    productionLineId?: string; // Add this
};