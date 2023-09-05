import tempHtml from './job-detail-preview.html';
import { InitSingleOrder } from '../../core/services/store/order/actions';
import { SingleOrder } from '../../core/services/store/order/selectors';
import { IJobItem } from '../../core/dto';

const JobDetailPreview = {
   selector: "jobDetailPreview",
   bindings: {
      ordId: '<'
   },
   transclude: true,
   template: tempHtml,
   controller: ['$scope', '$document', '$compile', 'api', 'clientDataStore', '$timeout', class JobDetailPreviewComponent {
      ordId: string = '';
      order;
      jobDetailsFilterSub_;
      jobDetailsSub_;
      mainComp;
      tip;
      mainHeight = 340;
      maxHeight = 600;
      mainWidth = 1000;
      bodyWidth = 0;
      bodyHeight = 0;
      tableHeight = 227;
      loadingTip;
      tipActiveClassName = 'tooltip-show';
      itemHeaders: {
         field: keyof (IJobItem & { isVisible });
         order: 'asc' | 'desc' | 'none';
         title: string;
         isVisible: boolean;
         isEditable: boolean;
         units: string;
         unitDecimals: number;
       }[] = [
           {
             field: 'bundle',
             order: 'none',
             title: 'Bundle',
             isVisible: true,
             isEditable: false,
             units: '',
             unitDecimals: 0,
           },
           {
             field: 'lengthIn',
             order: 'none',
             title: 'Length',
             isVisible: true,
             isEditable: false,
             units: 'in',
             unitDecimals: 3,
           },
           {
             field: 'quantity',
             order: 'none',
             title: 'Pieces',
             isVisible: true,
             isEditable: false,
             units: '',
             unitDecimals: 0,
           },
           {
             field: 'quantityDone',
             order: 'none',
             title: 'Pcs Done',
             isVisible: true,
             isEditable: false,
             units: '',
             unitDecimals: 0,
           },
           {
             field: 'patternName',
             order: 'none',
             title: 'Pattern',
             isVisible: true,
             isEditable: false,
             units: '',
             unitDecimals: 0,
             //sref: 'app.punch-patterns_list.detail({id: pattern.patternName})'
           },
           {
             field: 'weightLbs',
             order: 'none',
             title: 'Weight',
             isVisible: true,
             isEditable: false,
             units: 'lbs',
             unitDecimals: 0,
           },
           {
             field: 'sequence',
             order: 'asc',
             title: 'Sequence',
             isEditable: false,
             isVisible: true,
             units: '',
             unitDecimals: 0,
           },
           {
             field: 'externalItemId',
             order: 'none',
             title: 'Item ID',
             isVisible: true,
             isEditable: false,
             units: '',
             unitDecimals: 0,
           },
           {
             field: 'user1',
             order: 'none',
             title: 'itemUser1',
             isVisible: false,
             isEditable: true,
             units: '',
             unitDecimals: 0,
           },
           {
             field: 'user2',
             order: 'none',
             title: 'itemUser2',
             isVisible: false,
             isEditable: true,
             units: '',
             unitDecimals: 0,
           },
           {
             field: 'user3',
             order: 'none',
             title: 'itemUser3',
             isVisible: false,
             isEditable: true,
             units: '',
             unitDecimals: 0,
           },
           {
             field: 'user4',
             order: 'none',
             title: 'itemUser4',
             isVisible: false,
             isEditable: true,
             units: '',
             unitDecimals: 0,
           },
           {
             field: 'user5',
             order: 'none',
             title: 'itemUser5',
             isVisible: false,
             isEditable: true,
             units: '',
             unitDecimals: 0,
           },
           {
             field: 'messageText',
             order: 'none',
             title: 'Message',
             isVisible: true,
             isEditable: true,
             units: '',
             unitDecimals: 0,
           },
           {
             field: 'pieceMark',
             order: 'none',
             title: 'Piece Mark',
             isVisible: true,
             isEditable: true,
             units: '',
             unitDecimals: 0,
           },
           {
             field: 'bundleGroup',
             order: 'none',
             title: 'bundleGroup',
             isVisible: true,
             isEditable: true,
             units: '',
             unitDecimals: 0,
           },
         ];

      bundleItemHeaders = [
         {field: 'bundle', title: 'Bundle'},
         {field: 'bundleId', title: 'Id'},
         {field: 'changeId', title: 'Change Id'},
         {field: 'user1', title: 'User1'},
         {field: 'user2', title: 'User2'},
         {field: 'user3', title: 'User3'},
         {field: 'user4', title: 'User4'},
         {field: 'user5', title: 'User5'},

      ];
      hoverTimeout: any;
      constructor(private $scope, private $document, private $compile, private api, private clientDataStore, private $timeout) {
         $scope.$on('$destroy', () => {
            if(!!this.jobDetailsSub_) {
               this.jobDetailsFilterSub_.dispose();
               this.jobDetailsSub_.dispose();
            }
         });
      }
      onGetData(pos) {
         // todo: user settings should be stored once in the store
         this.api.user.settings.orderItemsColumns.get(
            {},
            userColumns => {
              this.itemHeaders.forEach(x => {
                x.isVisible =
                  userColumns.find(u => u.field === x.field)?.isChecked ??
                  x.isVisible;
              });
            },
            error => {
              console.error(error);
            }
          );
         const ordId = Number(this.ordId);
         const filter: { property: 'ordId'; values: (string | number)[] } = {
            property: 'ordId',
            values: [ordId],
         };
         this.jobDetailsFilterSub_ = this.clientDataStore
            .SelectJobDetailIn(filter)
            .subscribe();

         this.jobDetailsSub_ = this.clientDataStore.Selector(SingleOrder(ordId)).subscribe(singleOrder => {
            if (singleOrder) {
               this.order = singleOrder;
               const rows = this.order.items.length;
               const height = 113 + rows*40;
               console.log('pattern', this.order.items)

               if(height < 340) {
                  this.mainHeight = 340;
               } else if(height > 600) {
                  this.mainHeight = 600;
                  this.tableHeight = 487;
               } else {
                  this.mainHeight = height;
                  this.tableHeight = rows*40;
               }
               this.mainComp.append(this.tip);
               this.onShowContents(pos);
            }
         });
      }



      onGetContents() {
         return this.$compile(`<div class="jobDetailTooltip tooltip-show" ng-mouseenter="$ctrl.onShowTooltip1($event)"
            ng-mouseleave="$ctrl.onHideTooltip1()">
         <div class="main-container" ng-if="!!$ctrl.order">
            <div class="job-detail-tooltip-header">
               <div class="job-detail-tooltip-title">Order: {{$ctrl.order.job.orderCode}}</div>
               <div class="progress-container">
                  <md-progress-linear class="job-detail-progressbar" md-mode="determinate" value="$ctrl.order.completePerc"></md-progress-linear>
                  <p>{{$ctrl.order.completePerc | number : 0}}% complete</p>
               </div>
               <p class="machine-title">{{$ctrl.order.job.status | orderStatus}}</p>
            </div>
            <md-tabs md-dynamic-height md-center-tabs md-stretch-tabs="always" md-no-pagination>
               <md-tab label="Order">
                  <md-content class="md-padding flex-container right-padding-0 " ng-style="{ 'height' : $ctrl.tableHeight + 'px' }">
                     <div class="left-container">
                        <div class="multi-item-container">
                           <div class="item-container">
                              <div class="item-title">Material:</div>
                              <div class="item-content">{{$ctrl.order.job.materialCode}}</div>
                           </div>
                           <div class="item-des">{{$ctrl.order.job.materialDescription}}</div>
                        </div>
                        <div class="multi-item-container">
                           <div class="item-container">
                              <div class="item-title">Tooling:</div>
                              <div class="item-content">{{$ctrl.order.job.toolingCode}}</div>
                           </div>
                           <div class="item-des">{{$ctrl.order.job.toolingDescription}}</div>
                        </div>

                        <div class="item-container">
                           <div class="item-title">Machine:</div>
                           <div class="item-content">{{$ctrl.order.job.scheduleState.machine.description}}</div>
                        </div>
                        <div class="item-container">
                           <div class="item-title">Sequence:</div>
                           <div class="item-content">{{$ctrl.order.job.scheduleState.sequence}}</div>
                        </div>
                        <div class="item-container">
                           <div class="item-title">Customer Name:</div>
                           <div class="item-content">{{$ctrl.order.job.customerName}}</div>
                        </div>
                        <div class="item-container">
                           <div class="item-title"></div>
                           <div class="item-content">
                              <md-icon class="mdi" md-font-icon="mdi-pause-circle{{
                                 $ctrl.order.job.hold ? '-outline' : ''
                                 }}"></md-icon>
                              {{ $ctrl.order.job.hold ? 'Remove hold' : 'Hold' }}
                           </div>

                        </div>
                        <div class="item-container">
                           <div class="item-title">Required:</div>
                           <div class="item-content">{{$ctrl.order.job.requiredDate | amsDate}}</div>
                        </div>
                        <div class="item-container">
                           <div class="item-title"><span ng-if="$ctrl.order.job.scheduleState.state === 'Scheduled'">Estimated:</span>
                           <span ng-if="$ctrl.order.job.scheduleState.state === 'Done'">Completed:</span></div>
                           <div class="item-content">{{$ctrl.order.job.completionDate | amsDateTime}}</div>
                        </div>
                     </div>
                     <div class="right-container">
                        <div class="item-container">
                           <div class="item-title">Total:</div>
                           <div class="item-content">{{$ctrl.order.job.totalFt | unitsFormat :"ft":2:true}}<span class="sign">{{'ft' | userDisplayUnits}}</span></div>
                        </div>
                        <div class="item-container remaining-item">
                           <div class="item-title">Remaining:</div>
                           <div class="item-content">{{$ctrl.order.job.remainingFt | unitsFormat :"ft":2:true}}<span class="sign">{{'ft' |
                           userDisplayUnits}}</span></div>
                        </div>
                     </div>
                  </md-content>
               </md-tab>
               <md-tab label="Items">
                  <md-content class="md-padding bp-0 job-detail-scroll-container" ng-style="{ 'height' : $ctrl.tableHeight + 'px' }">
                     <table class="table-container">
                        <tr>
                           <th class="job-detail-col-item job-detail-col-item-header" ng-repeat="col in $ctrl.itemHeaders" ng-show="col.isVisible">
                              <span>{{col.title}}</span>
                           </th>
                        </tr>
                        <tr ng-repeat="item in $ctrl.order.items track by $index" class="hover order-detail-item">
                           <td class="job-detail-col-item" ng-repeat="col in $ctrl.itemHeaders" ng-show="col.isVisible">
                              <span ng-if="col.field!=='bundle' && col.field!=='patternName'">{{item[col.field] | unitsFormat:
                                 col.units:col.unitDecimal}}</span>
                              <span ng-if="col.field==='bundle'">{{item[col.field]}}</span>
                              <span ng-if="col.field==='patternName'">{{item[col.field]}}</span>
                           </td>
                        </tr>
                     </table>
                  </md-content>
               </md-tab>
               <md-tab label="Bundles">
                  <md-content class="md-padding bp-0 job-detail-scroll-container" ng-style="{ 'height' : $ctrl.tableHeight + 'px' }">
                     <table class="table-container">
                        <tr>
                           <th class="job-detail-col-item job-detail-col-item-header" ng-repeat="col in $ctrl.bundleItemHeaders">
                              <span>{{col.title}}</span>
                           </th>
                        </tr>
                        <tr ng-repeat="item in $ctrl.order.bundles track by $index" class="hover order-detail-item">
                           <td class="job-detail-col-item" ng-repeat="col in $ctrl.bundleItemHeaders">
                              {{item[col.field]}}
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
               ng-if="!$ctrl.order" class="md-accent job-detail-progressbar"
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
         if(!this.ordId) {
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

export default JobDetailPreview;
