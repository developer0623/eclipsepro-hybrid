import Temp from './print-summary-timebar.component.html';
const PrintSummaryTimebar = {

    bindings: {
      machine: '<',
      data: '<',
      state: '<'
    },
    template: Temp,
    controller: ['$element', function ($element) {
      let self = this;
      self.mainColor = ['#303030', '#666666', '#a63337', '#878787', '#c4c4c4', '#dcddde'];

      self.getMainArea= (order) => {
        let mainStyle = {'border-color': '', width: ''};
        switch(order) {
          case 0: {
            mainStyle["width"] = self.data.running*100 + '%';
            break;
          }
          case 1: {
            mainStyle["width"] = self.data.changeover*100 + '%';
            break;
          }
          case 2: {
            mainStyle["width"] = self.data.breakdown*100 + '%';
            break;
          }
          case 3: {
            mainStyle["width"] = self.data.otherDowntime*100 + '%';
            break;
          }
          case 4: {
            mainStyle["width"] = self.data.exempt*100 + '%';
            break;
          }
          case 5: {
            mainStyle["width"] = self.data.unscheduled*100 + '%';
            break;
          }
        }
        mainStyle["border-color"] = self.mainColor[order];

        return mainStyle;
      }

      self.getBottomWidth = () => {
        const width = 100 - self.data.unscheduled*100 + '%';
        return {'width' : width};
      }



    }]
}

export default PrintSummaryTimebar;
