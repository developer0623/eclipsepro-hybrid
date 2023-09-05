const AlertWarehouseLate = {

   bindings: {
      alert: '='
   },
   // Load the template
   template: `<div class="md-list-item-text" layout="column" layout-align="space-between">
   
               <div layout="row" layout-align="space-between">
   
                     <md-tooltip md-direction="bottom">{{$ctrl.alert.description | translate}}</md-tooltip>
                     <h3><i class="mdi mdi-tile-four s24 mr-5 {{$ctrl.alert.iconColor}}" ></i><span> {{$ctrl.alert.title | translate}}</span></h3>
   
               </div>
   
               <div class="ph-24 pt-10">

               <!--<div>{{$ctrl.alert.machine.description || "Machine " + $ctrl.alert.machineNumber}}</div>-->
               <hr />        
               <div>SCHEDULED FOR: {{$ctrl.alert.effectiveDate | date:'MM/dd/yy'}} at {{$ctrl.alert.effectiveDate | date:'shortTime'}}</div>
               <div>LATE BY: {{$ctrl.alert.effectiveDate | timeAgo}}</div>
                     
               </div>
   
            </div>`,
   controller: function () {
   }
}

export default AlertWarehouseLate;