import * as angular from "angular";
import { IApiResolverService } from "../../reference";
import { IReasonCode, ILocation } from '../dto';

export type WarehouseService = {
    addReason(reason: IReasonCode): Promise<unknown>;
    deleteReason(id: string): Promise<unknown>;
    addLocation(location: ILocation): Promise<unknown>;
    deleteLocation(id: string): Promise<unknown>;
};

export const warehouseService = (apiResolver: IApiResolverService) => {
    return {
        addReason: (reason: any) =>
            apiResolver.resolve("warehouse.addreason@post", reason),
        deleteReason: (id: any) =>
            apiResolver.resolve("warehouse.deletereason@delete", { id: id }),
        addLocation: (location: any) =>
            apiResolver.resolve("warehouse.addlocation@post", location),
        deleteLocation: (id: any) =>
            apiResolver.resolve("warehouse.deletelocation@delete", { id: id }),

    };
}

warehouseService.$inject = ['apiResolver']
