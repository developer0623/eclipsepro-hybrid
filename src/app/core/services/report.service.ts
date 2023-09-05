export type ReportService = {
  initDate(
    startDate: Date,
    endDate: Date,
    duration: string
  ): { startDate: Date; endDate: Date };
};

export function reportService(): ReportService {
  return {
    initDate: (startDate: Date, endDate: Date, duration: string) => {
      let newStartDate = startDate;
      let newEndDate = endDate;
      if (duration === 'week') {
        newStartDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate() - startDate.getDay()
        );
        newEndDate = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate() + (7 - endDate.getDay())
        );
      } else if (duration === 'month') {
        newStartDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          1
        );
        newEndDate = new Date(
          endDate.getFullYear(),
          endDate.getMonth() + 1,
          0
        );
      }

      return { startDate: newStartDate, endDate: newEndDate };
    },
  };
}

