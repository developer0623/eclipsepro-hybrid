import { IUserSession } from "./core/dto";


declare let toastr: any;
declare let Qty: any;
declare let BigNumber: any;

/** A global defined in index.html, whose value is set during the build. */
declare let BUILD_NUMBER: string;

// export interface Window { _ : any}

export interface IApiService {
  machine: any;
  downtime: any;
  search: any;
  metricDefs: any;
  icons: any;
  systemPreferences: any;
  system: any;
  alerts: any;
  orders: any;
  history: any;
  inventory: any;
  andon: any;
  explorer: any;
  features: any;
  baseUrl: string;
}
export interface IApiResolverService {
  resolve: <T>(action: string, parameters?) => Promise<T>
}

export interface IAuthService {
  getSession: () => Promise<void | IUserSession>
  logout: () => void,
}
