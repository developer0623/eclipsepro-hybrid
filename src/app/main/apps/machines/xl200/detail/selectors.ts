import { IMachine } from '../../../../../core/dto';
export const machineDetailsViewModel = (machine: IMachine) => {
  // No real reason for this except that since I created it
  // I'm keeping it in place. Probably will need it later.
  machine.eclipseEnforcedSetups.haltDelayMinimum.available =
    machine.uartVersion >= 3.51;
  machine.eclipseEnforcedSetups.useScrapCodes.available =
    machine.uartVersion >= 3.51;
  machine.eclipseEnforcedSetups.manualShearScrapLengthIn.available =
    machine.uartVersion >= 3.51;
  machine.eclipseEnforcedSetups.enforceEclipseCoilValidation.available =
    machine.uartVersion >= 3.51;
  machine.eclipseEnforcedSetups.enforceBundlingRules.available =
    machine.uartVersion >= 3.51;
  machine.eclipseEnforcedSetups.useCoilInventory.available =
    machine.uartVersion >= 3.51;
  machine.eclipseEnforcedSetups.allowCoilOverride.available =
    machine.uartVersion >= 3.51;
  machine.eclipseEnforcedSetups.autoRequestOrderFootage.available =
    machine.uartVersion >= 3.51;
  machine.eclipseEnforcedSetups.displayBundleIdPrompts.available =
    machine.uartVersion >= 3.53;
  machine.eclipseEnforcedSetups.autoDeleteDoneOrdersAfter.available =
    machine.uartVersion >= 3.53;
  machine.eclipseEnforcedSetups.showUserDataProgram.available =
    machine.uartVersion >= 3.59;
  machine.eclipseEnforcedSetups.showUserDataStatus.available =
    machine.uartVersion >= 3.59;
  machine.eclipseEnforcedSetups.staggerPanelField.available =
    machine.uartVersion >= 3.59;
  machine.eclipseEnforcedSetups.setDoneItemsToReady.available =
    machine.uartVersion >= 3.59;

  return {
    ...machine,
  };
};
