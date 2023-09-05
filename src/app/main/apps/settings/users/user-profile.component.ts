import { ClientDataStore } from '../../../../core/services/clientData.store';
import { IUser } from '../../../../core/dto';
import { Ams } from '../../../../amsconfig';

const UserProfile = {
  selector: "userProfile",
  template: `
    <div layout="column">
      <div>
        <label>Username</label>
        <div>{{$ctrl.username}}</div>
      </div>
      <div>
        <label>First name</label>
        <div editable-text="$ctrl.user.firstName" onaftersave="$ctrl.onSaveUserField('firstName', $data)">{{$ctrl.user.firstName || '&laquo;none&raquo;'}}</div>
      </div>
      <div>
        <label>Last name</label>
        <div editable-text="$ctrl.user.lastName" onaftersave="$ctrl.onSaveUserField('lastName', $data)">{{$ctrl.user.lastName || '&laquo;none&raquo;'}}</div>
      </div>
      <div>
        <label>Email</label>
        <div>{{$ctrl.user.email}}</div>
      </div>
    </div>`,
  bindings: { username: "<" },
  /** @ngInject */
  controller: ['clientDataStore', '$http', class UserDetailsComponent {
    username: string;
    user: IUser;
    subscription_: Rx.Disposable;

    constructor(
      private clientDataStore: ClientDataStore,
      private $http: angular.IHttpService
    ) {

      this.subscription_ = clientDataStore.SelectUsers().subscribe();

      clientDataStore
        .Selector((state) =>
          state.Users.find((u) => u.userName === this.username)
        )
        .subscribe((user) => {
          this.user = user;
        });
    }
    $onDestroy() {
      this.subscription_.dispose();
    }
    onSaveUserField(field: string, value: string) {
      this.$http.patch(Ams.Config.BASE_URL + `/_api/users/${this.user.userName}?${field}=${value}`, {});
    }
  }],
};

export default UserProfile;
