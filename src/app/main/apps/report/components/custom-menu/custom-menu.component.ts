import Temp from './custom-menu.component.html';
const CustomMenu_ = {
  selector: 'customMenu',
  bindings: {
    subject: '@',
    selectedItem: '<',
    menuList: '<',
    onChange: '&',
  },
  template: Temp,
  /** @ngInject */
  controller: class CustomMenuComponent {
    constructor() {}
  },
};

export default CustomMenu_;
