import { IAppState } from "..";

const PathfinderUserRolesMasterList = ['None', 'Operator', 'Administrator'];

export const UserSession = (state: IAppState) => state.UserSession;

export const RolesMasterList = [
  'administrator',
  'scheduler',
  'job-editor',
  'pfpc',
  'tooling-editor', 
  'pattern-editor', 
  'machine-manager',
];
export const UserList = (state: IAppState) => state.Users;

export const UserListModel = (state: IAppState) => {
  return {
    users: state.Users.map((u) => ({
      ...u,
      rolesModel: RolesMasterList.map((rm) => ({
        roleName: rm,
        enabled: u.roles.indexOf(rm) > -1,
      })),
      folderRolesModel: state.Folders.reduce((pfroles, pf) => {
        pfroles[pf.id] = u.folderRoles.find(x => x.folderId === pf.id)?.role || 'None';
        return pfroles;
      }, {}),
    })),
    systemPreferences: state.SystemPreferences,
    userIsAdmin: UserHasRole("administrator")(state),
    PathfinderUserRolesMasterList,
    pathfinders: state.Folders,
  };
};

export const UserHasRole = (role: string) => (state: IAppState) => {
  const session = UserSession(state);

  return session
    ? session.roles.findIndex(x => x.toLowerCase() === role.toLowerCase()) > -1
    : false;
};

export const UserHasRoles = (roles: string[], allRoles: boolean) => (state: IAppState) => {
  const session = UserSession(state);

  return session
    ? session.roles.filter(r => 
        roles.map(x=>x.toLowerCase()).indexOf(r.toLowerCase()) > -1)
        .length >= (allRoles ? roles.length : 1) 
    : false;
};
export const UserHasClaim = (claim: string) => (state: IAppState) => {
  const session = UserSession(state);

  return session
    ? session.claims.findIndex(x => x.toLowerCase() === claim.toLowerCase()) > -1
    : false;
};
