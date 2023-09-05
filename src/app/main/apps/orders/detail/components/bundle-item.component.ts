import { IBundleModel } from '../../../../../core/services/store/order/selectors';
import BundleTemplate from './bundle-item.component.html';
import AlertPng from '../../../../../../assets/icons/png-icon/alert.png';
import LocationPng from '../../../../../../assets/icons/png-icon/location.png';

const BundleItem = {
  selector: "bundleItem",
  bindings: {
    isdetail: "<",
    item: "<",
    onChecked: "&",
    maxWeightExceeded: "<",
  },
  template: BundleTemplate,
  controller: class BundleItemComponent {
    item: IBundleModel;

    maxWeightExceeded: boolean;
    maxPiecesExceeded: boolean;
    minLengthExceeded: boolean;

    maxPiecesOverage: number;
    maxWeightOverage: number;

    piecesRemaining: number;
    weightRemaining: number;

    weightRemainingPerc: string;
    piecesRemainingPerc: string;
    relativeMaxLengthPerc: string;
    relativeMinLengthPerc: string;

    $onChanges() {
      this.maxWeightExceeded = this.item.weightLbs > this.item.maxWeightLbs;
      this.maxPiecesExceeded = this.item.pieces > this.item.maxPieces;
      this.minLengthExceeded = this.item.bundleMinLengthIn < (this.item.bundleMaxLengthIn * this.item.minPercentOfMaxLength);

      this.maxPiecesOverage = this.item.pieces - this.item.maxPieces;
      this.maxWeightOverage = this.item.weightLbs - this.item.maxWeightLbs;

      this.piecesRemaining = this.item.maxPieces - this.item.pieces;
      this.weightRemaining = this.item.maxWeightLbs - this.item.weightLbs;


      this.weightRemainingPerc = ((this.item.weightLbs * 100) / this.item.maxWeightLbs).toFixed(0) + "%";
      this.piecesRemainingPerc = ((this.item.pieces* 100) / this.item.maxPieces).toFixed(0) + "%";
      this.relativeMaxLengthPerc = ((this.item.bundleMaxLengthIn * 100) / this.item.orderMaxLengthIn).toFixed(0) + "%";
      this.relativeMinLengthPerc = ((this.item.bundleMinLengthIn * 100) / this.item.orderMaxLengthIn).toFixed(0) + "%";
    }

    loadImage = function(img) {
      if (img === 'alert') {
        return AlertPng;
      }
      return LocationPng;
    }

    getWidth(val) {
      let style = { width: "" };
      switch (val) {
        case 0:
          style.width =
            ((this.item.weightLbs * 100) / this.item.maxWeightLbs).toFixed(0) +
            "%";
          break;
        case 1:
          style.width =
            ((this.item.pieces * 100) / this.item.maxPieces).toFixed(0) + "%";
          break;
        case 2:
          style.width =
            (
              (this.item.bundleMaxLengthIn * 100) /
              this.item.orderMaxLengthIn
            ).toFixed(0) + "%";
          break;
        case 3:
          style.width =
            (
              (this.item.bundleMinLengthIn * 100) /
              this.item.orderMaxLengthIn
            ).toFixed(0) + "%";
          break;
      }
      return style;
    }
  },
}; 

export default BundleItem;