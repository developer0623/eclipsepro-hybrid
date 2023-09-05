import Temp from './checkbox-menu.component.html';
import { CheckboxMenuItem } from '../../report-type';

const CheckboxMenu_ = {
  selector: 'checkboxMenu',
  bindings: {
    subject: '@',
    menuSubject: '@',
    menuList: '<',
    onChange: '&',
  },
  template: Temp,
  /** @ngInject */
  controller: class CheckboxMenuComponent {
    selectedItemsCount: number;
    mainTitle: string = 'All';
    allItem: { name: string; isChecked: boolean } = {
      name: 'All',
      isChecked: true,
    };
    menuList: CheckboxMenuItem[];
    subject: string;
    onChange: ({ items }) => any;

    constructor() {}

    initItems() {
      this.selectedItemsCount = this.menuList.filter(m => m.isChecked).length;
      this.allItem = {
        ...this.allItem,
        isChecked: this.selectedItemsCount === this.menuList.length,
      };
    }

    onClickItem(item) {
      if (item.name === 'All') {
        this.allItem.isChecked = !this.allItem.isChecked;
        this.checkedAllItems(this.allItem.isChecked);
      } else {
        item.isChecked = !item.isChecked;
        if (item.isChecked) {
          this.selectedItemsCount++;
        } else {
          this.selectedItemsCount--;
        }

        this.allItem.isChecked =
          this.selectedItemsCount === this.menuList.length;
      }
      this.onChange({ items: this.menuList });
    }

    isAllIndeterminate() {
      if (
        this.selectedItemsCount > 0 &&
        this.selectedItemsCount < this.menuList.length
      ) {
        return true;
      }
      return false;
    }

    checkedAllItems(flag) {
      this.menuList = this.menuList.map(item => {
        return {
          ...item,
          isChecked: flag,
        };
      });
      if (flag) {
        this.selectedItemsCount = this.menuList.length;
      } else {
        this.selectedItemsCount = 0;
      }
    }

    onGetTitle() {
      if (this.subject === 'MACHINES') {
        return this.selectedItemsCount;
      } else {
        if (this.selectedItemsCount === this.menuList.length) {
          return 'All';
        } else {
          return this.menuList
            .filter(menu => menu.isChecked)
            .reduce((mainVal, currentVal, index) => {
              if (index === 0) {
                return `${currentVal.name}`;
              }
              return `${mainVal} & ${currentVal.name}`;
            }, '');
        }
      }
    }

    $onChanges(changes) {
      console.log('changes', changes);
      if (
        changes.menuList &&
        ((!changes.menuList.previousValue && changes.menuList.currentValue) ||
          (changes.menuList.currentValue &&
            changes.menuList.previousValue &&
            changes.menuList.currentValue.length !==
              changes.menuList.previousValue.length))
      ) {
        this.initItems();
      }
    }
  },
};

export default CheckboxMenu_;
