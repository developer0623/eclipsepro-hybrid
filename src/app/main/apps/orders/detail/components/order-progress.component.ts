import OrderProgressTemplate from './order-progress.component.html';

const OrderProgressComponent = {
  selector: 'orderProgress',
  bindings: {
    percent: '<'
  },
  template: OrderProgressTemplate,
  controller: function () {
    let ctrl = this;

    ctrl.getWidth = () => {
      const width = ctrl.percent + '%';
      return {'width' : width};
    }

    ctrl.init = () => {
      ctrl.percent = ctrl.percent? ctrl.percent : 0;
    }

    ctrl.init();



  }
}

export default OrderProgressComponent;
