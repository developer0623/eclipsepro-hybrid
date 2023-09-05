featureFlagService.$inject = ['api']
export function featureFlagService(api) {
   return new FeatureFlagService(api);
}
export class FeatureFlagService {
   // The feature set is name:boolean pairs. The feature is OFF
   // iff the value is exactly a boolean false. IOW, everything
   // is on unless it's correctly marked false.
   // The client side feature always wins over the server and
   // therefore should only be used at design time.

   // Feature gates (set in the UI) can be multiple, delimited by
   // a `;`. All feature elements need to be false for the item
   // to be disabled.
   features = { dummy: false };

   featureDisabled(feature) {
      return feature.split(';').every(f => this.features[f] === false);
   }

   constructor(private api) { }

   refresh() {
      this.api.features.get(
         data => {
            this.features = { ...data, ...this.features };
         },
         error => {
            // console.log('Error loading features: ' + JSON.stringify(error));
         }
      );
   }

   setFeature(feature: string, enabled: boolean): Promise<unknown> {
      return this.api.features.post({ feature, enabled }, data => {
         this.refresh();
      }).$promise;
   }
}
