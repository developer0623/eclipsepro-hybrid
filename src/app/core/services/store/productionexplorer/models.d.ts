
export interface IExplorerDataRecord {
   id: string,
   date,
   shift: number,
   machine:
   {
      machineNumber: number,
      serialNumber: string,
      machineDescription: string
   },
   operator: {
      employeeNumber: string,
      employeeName: string
   },
   coil,
   materialCode: string,
   toolingCode: string,
   punching,
   partLengthIn,
   location: string,
   customerName: string,
   occurences,
   scrapOccurences,
   durationMinutes,
   exemptMinutes,
   downMinutes,
   runMinutes,
   goodFt,
   scrapLengthFt,
   lossCode,
   targetFPM,
   availabilityPotentialFt,
   speedPotentialFt,
   yieldPotentialFt,
   quantity,
   targetAvailabilityPotentialFt
}
export interface IExplorerDataModel {
   explorerData: IExplorerDataRecord[];
   range: { minDate: Date, maxDate: Date }
}

export interface IDeviceExplorerDataRecord {
   id: string,
   start,
   end,
   hourOfDay: number,
   dayOfWeek, //: string,
   machineId: string,
   operator: string,
   partId: string,
   runState: string,
   cycles: number,
   goodParts: number,
}
export interface IDeviceExplorerDataModel {
   explorerData: IDeviceExplorerDataRecord[];
   range: { minDate: Date, maxDate: Date }
}