
const AlertScheduleSlip = {

   bindings: {
      alert: '='
   },
   // Load the template
   template: `<div class="md-list-item-text" layout="column" layout-align="space-between">
   
               <div layout="row" layout-align="space-between">
   
                     <md-tooltip md-direction="bottom">{{$ctrl.alert.description | translate}}</md-tooltip>
                     <h3><i class="mdi mdi-clock s24 mr-5 {{$ctrl.alert.iconColor}}" ></i> {{$ctrl.alert.title | translate}}</h3>
   
               </div>
   
               <div class="ph-24 pt-10">
                     
               <div>{{$ctrl.alert.machine.description || "Machine " + $ctrl.alert.machineNumber}}</div>
               <hr />        
               <div>SCHEDULED FOR: {{$ctrl.alert.expectedDate | date:'MM/dd/yy'}} at {{$ctrl.alert.expectedDate | date:'shortTime'}}</div>
               <div>LATE BY: {{$ctrl.alert.expectedDate | timeAgo}}</div>
                     
               </div>
   
            </div>`,
   controller: function () {
   }
}

export default AlertScheduleSlip;