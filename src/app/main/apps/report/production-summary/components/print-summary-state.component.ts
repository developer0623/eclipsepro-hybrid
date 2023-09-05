import Temp from './print-summary-state.component.html';
const PrintSummaryState = {
  bindings: {
    data: '<',
    state: '<'
  },
  template: Temp,
  controller: ['$element', function ($element) {
    let self = this;

    self.init = () => {
      self.percent = 100 / (self.data.maxValue - self.data.minValue);
      self.startPos = self.data.okRangeStart * self.percent + '%';
      self.endPos = (self.data.okRangeEnd - self.data.okRangeStart) * self.percent + '%';
    }


    self.getMainArea = (order) => {
      let mainStyle = {};
      switch (order) {
        case 0: {
          mainStyle["width"] = self.startPos;
          break;
        }
        case 1: {
          mainStyle["width"] = self.endPos;
          break;
        }
        default: {
          mainStyle["flex"] = 1;
          break;
        }
      }

      return mainStyle;
    }

    self.getTargetPos = () => {
      let pos = self.data.targetValue * self.percent + '%';
      return { 'left': pos };

    }

    self.getValueState = () => {
      if (self.data.value < self.data.okRangeStart) {
        return 0;
      }

      if (self.data.value < self.data.okRangeEnd) {
        return 1;
      }

      return 2;
    }

    self.getValueArea = () => {
      let width = self.data.value * self.percent;
      if (width > 100) {
        width = 100;
      }
      const state = self.getValueState();
      return { 'width': width + '%' };
    }

    self.getRangePos = (order) => {
      if (order) {
        return { 'left': `calc(${self.startPos} + ${self.endPos} - 25px)` };
      } else {
        return { 'left': `calc(${self.startPos} - 25px)` };
      }
    }

    this.$onInit = function () {
      self.init();
    }


  }]
}

export default PrintSummaryState;
