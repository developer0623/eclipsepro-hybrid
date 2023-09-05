import tempHtml from './coil-type-preview.html';
import { InitSingleOrder } from '../../core/services/store/order/actions';
import { SingleOrder } from '../../core/services/store/order/selectors';
import { IJobItem } from '../../core/dto';
import { GridOptions } from 'ag-grid-community';

const CoilTypelPreview = {
   selector: "coilTypePreview",
   bindings: {
      materialId: '<'
   },
   transclude: true,
   template: tempHtml,
   controller: ['$scope', '$document', '$compile', 'api', 'clientDataStore', '$timeout', '$filter', class CoilTypelPreviewComponent {
      materialId: string = '';
      coilType;
      coilTypeSub_;
      coilsSub_;
      mainComp;
      tip;
      mainHeight = 400;
      maxHeight = 600;
      mainWidth = 1000;
      bodyWidth = 0;
      bodyHeight = 0;
      tableHeight = 300;
      loadingTip;
      tipActiveClassName = 'tooltip-show';
      agCoilGridOptions: GridOptions;
      columns = [
         {
           field: 'coilId',
           headerName: 'coilId',
           filter: 'agTextColumnFilter',
         },
         {
           field: 'lengthRemainingFt',
           headerName: 'remaining',
           filter: 'agNumberColumnFilter',
           valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 1)},
         },
         {
           field: 'lengthStartFt',
           headerName: 'startLength',
           filter: 'agNumberColumnFilter',
           valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 1)},
         },
         {
           field: 'dateIn',
           //cellFilter: 'age:row.entity.dateOut',
           headerName: 'dateIn',
           filter: 'agDateColumnFilter',
           valueFormatter: params => { return this.$filter('amsDate')(params.value)},
         },
         {
           field: 'location.name',
           headerName: 'location',
           filter: 'agTextColumnFilter',
         },
      ];
      knownCoilIds: string[] = [];
      hoverTimeout: any;
      constructor(private $scope, private $document, private $compile, private api, private clientDataStore, private $timeout, private $filter) {
         $scope.$on('$destroy', () => {
            if(!!this.coilsSub_) {
               this.coilTypeSub_.dispose();
               this.coilsSub_.dispose();
            }
         });

         this.agCoilGridOptions = {
            angularCompileRows: true,
            headerHeight: 25,
            defaultColDef: {
              sortable: true,
              //resizable: true,
              headerValueGetter: params => {return this.$filter('translate')(params.colDef.headerName)},
              tooltipValueGetter: params => {
                if (typeof params.value === 'string') {
                  return params.value;
                }
                return;
              },
            },
            columnDefs: this.columns,
            getRowNodeId: (data) => data.id,
            //onColumnResized: this.onColumnResized,
            enableCellChangeFlash: true,
            // onSortChanged: this.onSortChanged,
         };
      }
      onGetData(pos) {

         this.coilTypeSub_ = this.clientDataStore
            .SelectCoilTypes()
            .flatMap(cts => cts.filter(ct => ct.materialCode === this.materialId))
            .subscribe(coilType => {
               this.coilType = coilType;
            });

         this.coilsSub_ = this.clientDataStore
            .SelectCoilDtosIn({ property: 'MaterialCode', values: [this.materialId] })
            .subscribe(coils => {
               //this.coilsGridOptions.data = coils;if (this.agGridOptions.api) {
               let n = [];
               let u = [];
               let d = [];
               let newKnown: string[] = [];
               if (this.agCoilGridOptions.api) {
                  coils.forEach(coil => {
                     // if (job.isDeleted){
                     //   d.push(job);
                     // } else {
                     newKnown.push(coil.coilId);
                     if (this.knownCoilIds.indexOf(coil.coilId) >= 0){
                        u.push(coil);
                     } else {
                        n.push(coil);
                     }
                     //}
                  });
                  this.knownCoilIds = newKnown;
                  this.agCoilGridOptions.api.applyTransaction({
                     add: n,
                     update: u,
                     remove: d});

                  this.agCoilGridOptions.api.sizeColumnsToFit();
               }
               this.mainComp.append(this.tip);
               this.onShowContents(pos);
            }
         );
      }



      onGetContents() {
         return this.$compile(`<div class="jobDetailTooltip coilTypeTooltip tooltip-show" ng-mouseenter="$ctrl.onShowTooltip1($event)"
            ng-mouseleave="$ctrl.onHideTooltip1()">
         <div class="main-container" ng-if="!!$ctrl.coilType">
            <div class="job-detail-tooltip-header coil-type-tooltip-header">
               <div class="job-detail-tooltip-title coil-type-tooltip-title">
                  Material: {{$ctrl.coilType.materialCode}}
                  </br>
                  <span class="font-size-16 secondary-text">{{$ctrl.coilType.description}}</span>
               </div>
               <div class="header-right-container">
                  <div class="item-container">
                     <div class="item-title"><span translate="onHand"></span>:</div>
                     <div class="item-content">{{$ctrl.coilType.onHandFt | unitsFormat :"ft":1 }}</div>
                  </div>
                  <div class="item-container">
                     <div class="item-title"><span translate="demand"></span>:</div>
                     <div class="item-content">{{$ctrl.coilType.demandFt | unitsFormat :"ft":1 }}</div>
                  </div>
                  <div class="item-container">
                     <div class="item-title"><span translate="balance"></span>:</div>
                     <div class="item-content">{{$ctrl.coilType.balanceFt | unitsFormat :"ft":1 }}</div>
                  </div>
               </div>
            </div>

            <md-content class="md-padding flex-container right-padding-0" >
               <div class="left-container">
                  <div class="item-container">
                     <div class="item-title"><span translate="width"></span>:</div>
                     <div class="item-content">{{$ctrl.coilType.widthIn | unitsFormat :"in":2}}</div>
                  </div>
                  <div class="item-container">
                     <div class="item-title"><span translate="thickness"></span>:</div>
                     <div class="item-content">{{$ctrl.coilType.thicknessIn | unitsFormat :"in":2}}</div>
                  </div>
                  <div class="item-container">
                     <div class="item-title"><span translate="gauge"></span>:</div>
                     <div class="item-content">{{$ctrl.coilType.gauge | unitsFormat :"ga":0}}</div>
                  </div>
               </div>
               <div class="right-container">
                  <div class="item-container">
                     <div class="item-title">Lbs Per Feet:</div>
                     <div class="item-content">{{$ctrl.coilType.lbsPerFt | unitsFormat :"lbs":2 }}</div>
                  </div>
                  <div class="item-container">
                     <div class="item-title"><span translate="color"></span>:</div>
                     <div class="item-content">{{$ctrl.coilType.color }}</div>
                  </div>
                  <div class="item-container">
                     <div class="item-title"><span translate="materialType"></span>:</div>
                     <div class="item-content">{{$ctrl.coilType.type }}</div>
                  </div>
               </div>
            </md-content>

               <md-content class="md-padding bp-0 job-detail-scroll-container">
                  <div ag-grid="$ctrl.agCoilGridOptions" class="ag-theme-balham" style="height:280px;"></div>
               </md-content>

            </div>
         </div>`)(this.$scope);
      }

      onShowLoading(pos) {
         this.loadingTip = this.$compile(`<div class="job-detail-progressbar-container">
            <md-progress-circular
               ng-if="!$ctrl.coilType" class="md-accent job-detail-progressbar"
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
         if(!this.materialId) {
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

export default CoilTypelPreview;
