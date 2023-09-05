import { IAppState } from ".."


const by = selector => (e1, e2) => selector(e1) > selector(e2) ? 1 : -1;
export const licenseVM = (state: IAppState) =>
({
   ...state.License,
   machines: state.License.machines.sort(by(m => m.unitNum)),
   modules: state.License.modules.sort(by(m => m.name))
})
