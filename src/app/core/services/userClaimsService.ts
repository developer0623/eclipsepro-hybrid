import * as angular from "angular";
import { ClientDataStore } from "./clientData.store";
import { IAppState } from "./store";

userClaimsService.$inject = ['clientDataStore']
export function userClaimsService(clientDataStore: { getValue: () => IAppState }) {

   return {
      hasClaim: (claims: string) => {
         const userSession = clientDataStore.getValue().UserSession;
         if (userSession) {
            return claims.split(' ').some(claim => userSession.claims.includes(claim));
         }
         return false;
      }
   }

}
