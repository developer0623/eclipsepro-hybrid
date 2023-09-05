import { IAppState } from "..";
import { IDeviceExplorerDataModel, IExplorerDataModel } from "./models";



export const ExplorerData = (store: IAppState) => store.ExplorerData;
export const DeviceExplorerData = (store: IAppState) => store.DeviceExplorerData;

export function updateLocalUnits(unitsService) {
   return (data: IExplorerDataModel) => {
      const localFtType = unitsService.getUserUnits('ft');
      const localInType = localFtType === 'ft' ? 'ft' : 'cm';
      return {
         ...data,
         explorerData: data.explorerData.map(record => ({
            ...record,
            goodLocal: unitsService.convertUnits(record.goodFt, 'ft', 0, localFtType),
            scrapLengthLocal: unitsService.convertUnits(record.scrapLengthFt, 'ft', 0, localFtType),
            partLengthLocal: unitsService.convertUnits(record.partLengthIn, 'in', 1, localInType)
         }))
      };
   }
}

export function mapDeviceData() {
   return (data: IDeviceExplorerDataModel) => {
      return {
         ...data,
         explorerData: data.explorerData
      };
   }
}
