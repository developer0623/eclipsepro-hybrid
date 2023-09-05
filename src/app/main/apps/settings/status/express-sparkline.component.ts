const ExpressSparkline = {
  selector: 'expressSparkline',

  bindings: {
    datas: '<',
  },
  // Load the template
  template: `<nvd3 color="#E01B5D" options="$ctrl.sparkline.options" data="$ctrl.sparkline.data" config="$ctrl.sparkline.config" api="$ctrl.api"></nvd3>`,
  controller: function () {
    let self = this;

    self.sparkline = {
      options: {
        chart: {
          type: 'sparklinePlus',
          height: 100,
          width: 150,
          showLastValue: false,
          noData: null,
          useInteractiveGuideline: true,
          transitionDuration: 200,
          margin: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10
          },
          x: function (d) {
            return d.ordinal;
          },
          y: function (d) {
            return d.value;
          },
        }
      },
      config: {
        //  deepWatchData : true,
        refreshDataOnly: true
      },
      data: []
    };

    self.$onChanges = (changes) => {
      if (changes.datas && changes.datas.currentValue) {
        self.sparkline = {
          ...self.sparkline,
          data: changes.datas.currentValue
        }
        if (self.api) {
          self.api.clearElement();
        }
      }
    }
  }
}

export default ExpressSparkline;
