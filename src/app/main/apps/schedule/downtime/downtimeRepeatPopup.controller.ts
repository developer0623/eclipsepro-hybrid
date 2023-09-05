import angular from 'angular';

export function RepeatDialogController(
    $scope: angular.IScope,
    $mdDialog,
    downtimeData
  ) {
    let vm = this;
    vm.downtimeData = {};
    vm.repeatData = [
      {
        label: 'One Time',
        value: 'OneTime',
      },
      {
        label: 'Daily',
        value: 'Daily',
      },
      {
        label: 'Weekly',
        value: 'Weekly',
      },
      {
        label: 'Monthly',
        value: 'Monthly',
      },
    ];
    vm.monthDays = [];
    for (let i = 1; i <= 31; i++) {
      vm.monthDays.push(i);
    }
    vm.weekData = [
      {
        id: 'S',
        day: 'Sunday',
      },
      {
        id: 'M',
        day: 'Monday',
      },
      {
        id: 'T',
        day: 'Tuesday',
      },
      {
        id: 'W',
        day: 'Wednesday',
      },
      {
        id: 'T',
        day: 'Thursday',
      },
      {
        id: 'F',
        day: 'Friday',
      },
      {
        id: 'S',
        day: 'Saturday',
      },
    ];
    vm.weekDayOfMonth = [
      'Week Day',
      'Weekend Day',
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    vm.DayOfMonth = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Last'];
    vm.everyCount = [1, 2, 3, 4, 5];
    vm.downtimeData.everyCount = vm.everyCount[0];

    vm.downtimeData.monthValue = 'Each';
    vm.dates = [];
    for (let i = 0; i < vm.monthDays.length; i++) {
      if (i % 7 === 0) {
        vm.dates.push([]);
      }
      vm.dates[vm.dates.length - 1].push(vm.monthDays[i]);
    }
    vm.todayDate = new Date().getDate();
    vm.downtimeData.dayOfMonth = vm.DayOfMonth[0];
    vm.downtimeData.weekDayOfMonth = vm.weekDayOfMonth[0];
    vm.downtimeData.monthValue = 'Each';
    if (downtimeData) {
      vm.downtimeData = angular.copy(downtimeData);
    }
    let occurs = vm.downtimeData.occurs.split(' :');
    vm.downtimeData.occurs = occurs[0];
    if (!vm.downtimeData.dayOfMonth || !vm.downtimeData.weekDayOfMonth) {
      vm.downtimeData.dayOfMonth = vm.DayOfMonth[0];
      vm.downtimeData.weekDayOfMonth = vm.weekDayOfMonth[0];
    }
    if (!vm.downtimeData.everyCount) {
      vm.downtimeData.everyCount = vm.everyCount[0];
    }

    if (!vm.downtimeData.selectedDate) {
      vm.downtimeData.selectedDate = [];
    }

    if (!vm.downtimeData.monthValue) {
      vm.downtimeData.monthValue = 'Each';
    }

    if (vm.downtimeData.weekDayOfMonth === 'WeekendDay') {
      vm.downtimeData.weekDayOfMonth = 'Weekend Day';
    } else if (vm.downtimeData.weekDayOfMonth === 'WeekDay') {
      vm.downtimeData.weekDayOfMonth = 'Week Day';
    }

    vm.selectedDay = function (day) {
      if (vm.downtimeData.selectedDate.length) {
        if (vm.downtimeData.selectedDate.indexOf(day) > -1) {
          let index = vm.downtimeData.selectedDate.indexOf(day);
          vm.downtimeData.selectedDate.splice(index, 1);
        } else {
          vm.downtimeData.selectedDate.push(day);
        }
      } else {
        vm.downtimeData.selectedDate.push(day);
      }
    };

    if (!vm.downtimeData.daysOfWeek) {
      vm.downtimeData.daysOfWeek = [];
    }
    vm.selectedWeekDay = function (weekDay) {
      if (vm.downtimeData.daysOfWeek.length) {
        if (vm.downtimeData.daysOfWeek.indexOf(weekDay) > -1) {
          let index = vm.downtimeData.daysOfWeek.indexOf(weekDay);
          vm.downtimeData.daysOfWeek.splice(index, 1);
        } else {
          vm.downtimeData.daysOfWeek.push(weekDay);
        }
      } else {
        vm.downtimeData.daysOfWeek.push(weekDay);
      }
    };

    vm.hide = function () {
      $mdDialog.hide();
    };
    vm.cancel = function () {
      $mdDialog.hide('cancel');
    };
    vm.saveRepeatDetails = function (downtimeData) {
      if (vm.downtimeData.occurs !== 'Weekly') {
        vm.downtimeData.daysOfWeek = [];
      }
      if (vm.downtimeData.occurs !== 'Monthly') {
        vm.downtimeData.monthValue = 'Each';
        vm.downtimeData.selectedDate = [];
        vm.downtimeData.dayOfMonth = vm.DayOfMonth[0];
        vm.downtimeData.weekDayOfMonth = vm.weekDayOfMonth[0];
      }
      if (vm.downtimeData.monthValue === 'OnThe') {
        vm.downtimeData.selectedDate = [];
      } else if (vm.downtimeData.monthValue === 'Each') {
        vm.downtimeData.dayOfMonth = vm.DayOfMonth[0];
        vm.downtimeData.weekDayOfMonth = vm.weekDayOfMonth[0];
      }
      $mdDialog.hide(downtimeData);
    };
  }
