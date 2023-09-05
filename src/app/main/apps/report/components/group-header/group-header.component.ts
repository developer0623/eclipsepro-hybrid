import Temp from './group-header.component.html';
const GroupHeader_ = {
  selector: 'groupHeader',
  bindings: {
    header: '<',
  },
  template: Temp,
  /** @ngInject */
  controller: class GroupHeaderComponent {
    constructor() {}
  },
};

export default GroupHeader_;
