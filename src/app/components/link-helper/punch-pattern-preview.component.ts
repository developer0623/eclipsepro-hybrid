import tempHtml from './punch-pattern-preview.html';
import { InitSingleOrder } from '../../core/services/store/order/actions';
import { SingleOrder } from '../../core/services/store/order/selectors';
import { PatternDef, PatternDefPunch, AvailableMacro, } from '../../core/dto';
import { Ams } from '../../amsconfig';

const PunchPatternlPreview = {
   selector: "punchPatternPreview",
   bindings: {
      patternId: '<',
   },
   transclude: true,
   template: tempHtml,
   controller: ['$scope', '$document', '$compile', '$http', 'clientDataStore', '$timeout', class PunchPatternlPreviewComponent {
      patternId: string = '';
      pattern;
      punches;
      availableMacros;
      mainComp;
      tip;
      mainHeight = 300;
      maxHeight = 600;
      mainWidth = 1000;
      bodyWidth = 0;
      bodyHeight = 0;
      tableHeight = 187;
      loadingTip;
      tipActiveClassName = 'tooltip-show';
      punchColumns = [
         {
            field: "idType",
            displayName: "punchType",
         },
         {
            field: "toolId",
            displayName: "tool",
         },
         {
            field: "xOffset",
            displayName: "xOffset",
         },
         {
            field: "xReference",
            displayName: "xReference",
         },
         {
            field: "yOffset",
            displayName: "yOffset",
         },
         {
            field: "yReference",
            displayName: "yReference",
         },
      ];
      hoverTimeout: any;

      constructor(private $scope, private $document, private $compile, private $http: ng.IHttpService, private clientDataStore, private $timeout) {

      }
      onGetData(pos) {
         const patternId = this.patternId;
         this.$http
            .get<PatternDef>(
               `${Ams.Config.BASE_URL}/_api/punchpatterns/${patternId}`
            )
            .then((response) => {
               this.pattern = response.data;
               const rows = this.pattern.punches.length;
               const height = 113 + rows*40;
               console.log('pattern', this.pattern.punches)

               if(height < 300) {
                  this.mainHeight = 300;
               } else if(height > 600) {
                  this.mainHeight = 600;
                  this.tableHeight = 487;
               } else {
                  this.mainHeight = height;
                  this.tableHeight = rows*40;
               }
               this.mainComp.append(this.tip);
               this.onShowContents(pos);
            });
      }



      onGetContents() {
         return this.$compile(`<div class="jobDetailTooltip tooltip-show" ng-mouseenter="$ctrl.onShowTooltip1($event)"
            ng-mouseleave="$ctrl.onHideTooltip1()">
         <div class="main-container" ng-if="!!$ctrl.pattern">
            <div class="job-detail-tooltip-header">
               <div class="job-detail-tooltip-title">Pattern: {{$ctrl.pattern.patternName}}</div>
            </div>
            <md-tabs md-dynamic-height md-center-tabs md-stretch-tabs="always" md-no-pagination>
               <md-tab label="Pattern">
                  <md-content class="md-padding flex-container right-padding-0"  ng-style="{ 'height' : $ctrl.tableHeight + 'px' }">
                     <div class="left-container">
                        <div class="item-container">
                           <div class="item-title"><span translate="punchCount"></span>:</div>
                           <div class="item-content">{{$ctrl.pattern.punches.length}}</div>
                        </div>
                        <div class="item-container">
                           <div class="item-title"><span translate="defaultLength"></span> ({{'in' | userDisplayUnits : true}}):</div>
                           <div class="item-content">{{$ctrl.pattern.defaultLength}}</div>
                        </div>
                        <div class="item-container">
                           <div class="item-title"><span translate="created"></span>:</div>
                           <div class="item-content">{{$ctrl.pattern.importDate | date : 'MM/dd/yyyy'}}</div>
                        </div>
                        <div class="item-container">
                           <div class="item-title"><span translate="lastUsed"></span>:</div>
                           <div class="item-content">{{$ctrl.pattern.lastUsedDate | date : 'MM/dd/yyyy'}}</div>
                        </div>
                     </div>
                     <div class="right-container">
                        <div class="item-container">
                           <div class="item-content">
                              <md-checkbox ng-model="$ctrl.pattern.isMacro" ng-disabled="true" aria-label="check">
                                 <span translate="patternMacro"></span>
                              </md-checkbox>
                           </div>
                        </div>
                        <div class="item-container">
                           <div class="item-content">
                              <md-checkbox ng-model="$ctrl.pattern.isPermanent" ng-disabled="true" aria-label="check">
                                 <span translate="permanent"></span>
                              </md-checkbox>
                           </div>
                        </div>
                     </div>
                  </md-content>
               </md-tab>
               <md-tab label="Punches">
                  <md-content class="md-padding bp-0 job-detail-scroll-container" ng-style="{ 'height' : $ctrl.tableHeight + 'px' }">
                     <table class="table-container">
                        <tr>
                           <th class="job-detail-col-item job-detail-col-item-header" ng-repeat="col in $ctrl.punchColumns">
                              <span>{{col.displayName | translate}}</span>
                           </th>
                        </tr>
                        <tr ng-repeat="item in $ctrl.pattern.punches track by $index" class="hover order-detail-item">
                           <td class="job-detail-col-item" ng-repeat="col in $ctrl.punchColumns">
                              <span>{{item[col.field]}}</span>
                           </td>
                        </tr>
                     </table>

                  </md-content>
               </md-tab>
            </md-tabs>
            </div>
         </div>`)(this.$scope);
      }

      onShowLoading(pos) {
         this.loadingTip = this.$compile(`<div class="job-detail-progressbar-container">
            <md-progress-circular
               ng-if="!$ctrl.pattern" class="md-accent job-detail-progressbar"
               md-mode="indeterminate" md-diameter="32">
            </md-progress-circular>
            </div>`)(this.$scope);
         this.mainComp.append(this.loadingTip);
         let offset = this.loadingTip.offset();
         const { top, right} = this.onGetLoadingPosition(pos.top, pos.right);
         offset.top = top;
         offset.left = right;
         this.loadingTip.offset(offset);
      }

      onGetLoadingPosition(top, right) {
         let realTop = 0;
         let realRight = 0;
         // Right-Down
         if(right < this.bodyWidth/3 && top < this.bodyHeight/3) {
            realRight = right;
            realTop = top - 5;
         } // Center-Down
         else if (right < this.bodyWidth*2/3 && right >= this.bodyWidth/3 && top < this.bodyHeight/3) {
            realRight = right - 270;
            realTop = top + 20;
         } // Left-Down
         else if(right >= this.bodyWidth*2/3 && top < this.bodyHeight/3) {
            realRight = right - 550;
            realTop = top + 10;
         } // Right-Middle
         else if (right < this.bodyWidth/2 && top >= this.bodyHeight/3 && top < this.bodyHeight*2/3) {
            realRight = right - 5;
            realTop = top - 10 ;
         } // Left-Middle
         else if (right >= this.bodyWidth/2 && top >= this.bodyHeight/3 && top < this.bodyHeight*2/3) {
            realRight = right - 555;
            realTop = top - 10;
         } // Right-Up
         else if (right < this.bodyWidth/3 && top >= this.bodyHeight*2/3) {
            realRight = right - 10;
            realTop = top - 35;
         } // Center-Up
         else if (right < this.bodyWidth*2/3 && right >= this.bodyWidth/3 && top >= this.bodyHeight*2/3) {
            realRight = right - 270;
            realTop = top - 35;
         } // Left-Up
         else {
            realRight = right - 550;
            realTop = top - 25;
         }
         return { top: realTop, right: realRight}
      }

      onGetPosition(top, right) {
         let realTop = 0;
         let realRight = 0;

         // Right-Down
         if(right < this.bodyWidth/3 && top < this.bodyHeight/3) {
            realRight = right - 10;
            realTop = top;
         } // Center-Down
         else if (right < this.bodyWidth*2/3 && right >= this.bodyWidth/3 && top < this.bodyHeight/3) {
            realRight = right - this.mainWidth/2;
            realTop = top + 10;
         } // Left-Down
         else if(right >= this.bodyWidth*2/3 && top < this.bodyHeight/3) {
            realRight = right - this.mainWidth - 30;
            realTop = top + 10;
         } // Right-Middle
         else if (right < this.bodyWidth/2 && top >= this.bodyHeight/3 && top < this.bodyHeight*2/3) {
            realRight = right - 5;
            realTop = top - this.mainHeight/2 - 10;
         } // Left-Middle
         else if (right >= this.bodyWidth/2 && top >= this.bodyHeight/3 && top < this.bodyHeight*2/3) {
            realRight = right - this.mainWidth - 55;
            realTop = top - this.mainHeight/2 - 10;
         } // Right-Up
         else if (right < this.bodyWidth/3 && top >= this.bodyHeight*2/3) {
            realRight = right - 20;
            realTop = top - this.mainHeight - 10;
         } // Center-Up
         else if (right < this.bodyWidth*2/3 && right >= this.bodyWidth/3 && top >= this.bodyHeight*2/3) {
            realRight = right - this.mainWidth/2;
            realTop = top - this.mainHeight - 10;
         } // Left-Up
         else {
            realRight = right - this.mainWidth - 20;
            realTop = top - this.mainHeight - 10;
         }
         return { top: realTop, right: realRight}
      }

      onShowContents(pos) {
         let offset = this.tip.offset(),
         tipOffset = 10;
         const {top, right} = this.onGetPosition(pos.top, pos.right);
         offset.top = top;
         offset.left = right;
         this.tip.offset(offset);
      }

      onShowTooltip(e) {
         let pos = e.target.getBoundingClientRect();
         if(!this.patternId) {
            return;
         }
         this.hoverTimeout = this.$timeout(() => {    
            if(!this.tip) {
               this.mainComp = this.$document.find('body');
               this.bodyHeight = this.mainComp[0]?.clientHeight ?? 0;
               this.bodyWidth = this.mainComp[0]?.clientWidth ?? 0;
               this.onShowLoading(pos);
               this.tip = this.onGetContents();
               this.onGetData(pos);
            } else {
               this.tip.addClass(this.tipActiveClassName);
               this.onShowContents(pos);
            }
         }, 300);
      }

      onHideTooltip() {
         this.$timeout.cancel(this.hoverTimeout);
         if (this.tip) {
            this.tip.removeClass(this.tipActiveClassName);
         }
         if(this.loadingTip) {
            this.loadingTip.remove();
         }
      }

      onShowTooltip1(e) {
         this.tip.addClass(this.tipActiveClassName);
      }

      onHideTooltip1() {
         this.tip.removeClass(this.tipActiveClassName);
      }

   }],
   controllerAs: '$ctrl'
};

export default PunchPatternlPreview;
