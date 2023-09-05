const AlertIntegrationError = {
   bindings: {
      alert: '='
   },
   template: `<div class="md-list-item-text" layout="column" layout-align="space-between">      
                  <div layout="row" layout-align="space-between">                              
                     <h3><i class="mdi mdi-phone-missed s18 mr-5 orange-fg" ></i> {{$ctrl.alert.title | translate}}</h3>      
                  </div>
                  <div><!-- class="ph-24 pt-10">-->
                     <div>{{$ctrl.alert.description}}</div>
                     <div>{{$ctrl.alert.created | date:'short'}}</div>
                     <hr />
                  </div>
               </div>`,
   controller: function () {
   }
};

export default AlertIntegrationError;