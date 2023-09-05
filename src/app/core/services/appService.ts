export function appService() {
   return new AppService();
}

// A place to set the application state. This might not be the best place
// for this but it can move as needed (possibly to store)
export class AppService {
   isLoading: boolean;

   constructor() {
      this.isLoading = false;
   }

   setLoading(isLoading: boolean) {
      this.isLoading = isLoading;
   }
}
