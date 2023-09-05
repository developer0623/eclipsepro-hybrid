import Temp from './summary-state.component.html';

const SummaryState = {

  bindings: {
    data: '<',
    state: '<'
  },
  template: Temp,
  controller: ['$element', function ($element) {
    let self = this;

    self.init = () => {
      self.percent = 100 / (self.data.maxValue - self.data.minValue);
      self.mainColor = ['rgb(153, 153, 153)', '#b2b2b2', '#d4d4d4'];
      self.valueBgCol = ['#c1272d', '#4d4d4d', '#2f7852'];
      self.startPos = self.data.okRangeStart * self.percent + '%';
      self.endPos = (self.data.okRangeEnd - self.data.okRangeStart) * self.percent + '%';
    }

    this.$onInit = function () {
      self.init();
    }

    self.getMainArea = (order) => {
      let mainStyle = { 'background-color': '' };
      if (self.state) {
        mainStyle["background-color"] = self.mainColor[2 - order];
      } else {
        mainStyle["background-color"] = self.mainColor[order];
      }

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
      let bgCol = '';
      if (self.state) {
        bgCol = self.valueBgCol[2 - state];
      } else {
        bgCol = self.valueBgCol[state];
      }

      return { 'width': width + '%', 'background-color': bgCol };
    }

    self.getRangePos = (order) => {
      if (order) {
        return { 'left': `calc(${self.startPos} + ${self.endPos} - 25px)` };
      } else {
        return { 'left': `calc(${self.startPos} - 25px)` };
      }
    }
  }]
}

export default SummaryState;
