import { IMachine } from "../../../dto";

export function machineHasClaim(claims: string) {
   return (machine: IMachine) => {
      let clms = claims.split(' ');
      return machine.claims.filter(c => clms.includes(c)).length > 0;
   }
}
