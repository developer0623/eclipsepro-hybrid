import { IAppState } from "../../../../core/services/store";
export const SingleTooling = (toolingCode: string) => (state: IAppState) => {
  const td = state.ToolingDefs.find(t => t.toolingCode === toolingCode);
  if (td)
    return {
      ...td,
      machines: td.machines.map(m => ({
        ...m,
        name: m.machineName,
      })),
    };
  else return null;
};
