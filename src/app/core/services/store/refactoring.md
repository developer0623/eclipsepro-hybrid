# Refactoring to the Store

#### In depth article explaining the store (redux) concept

## Getting data out of the store

### How it works now, and why it's wrong
We have a class named `ClientDataStore` which inherits from a base class `DataStore`. On `ClientDataStore` we have added a select (kinda of like a getter) member function for each collection of data we keep in the store. For example, we have `ClientDataStore.SelectCoils()` which returns an `Observable<ICoilDto[]>`. It's an observable so that when data updates are received (from the server presumably) the store can notify subscribers. 

#### Example of current usage
Say we're in a controller and we want coil data to display. Currently we'd have something like this:
```
const coilSub_ = clientDataStore.SelectCoils()
    .Subscribe(data => {
        vm.coils = data;
    });
```

A couple of extra helpful things are happening inside that `SelectCoils()` call. First, an http fetch is made to get the initial set of coils. That set is added to the store. Then further calls are made to take a subscription with the server so that it knows to send us any _updates_ on those coils. These updates are also routed into the store for us. Frankly, that's pretty handy. But it has downsides.

The base class is not a bad implementation. It is general and reusable and so forth. The problem is when we want to merge or join two different collections that are already in the store we are forced to use the Observable operators to do so, and they can be complex. And that approach will not map to our Angular port very well either.

### The better way

Create a `selector` function and pass it to `ClientDataStore.Selector(selector)`. 

#### What is a `selector`?

The inside the store is one big giant object called `AppState`. This object has _all_ the data added to the store hanging off some member somewhere. It looks something like this:

```typescript
interface IAppState {
  ReasonCode: IReasonCode[]
  Location: ILocation[]
  MaterialTask: ITask[]
  SystemPreferences: ISystemPreferences
  SystemInfo: ISystemInfo
  ScheduledJobs: ISchedule[]
  Subscriptions: Fx.Subscription[]
  ... // and lots more
```

In fact it has exactly one member for each reducer used to create it. The reducers are simply manipulating their individual member.

So `ClientDataStore.Selector(...)` hands your selector the _entire_ `AppState` object. This makes it really easy to join any number of collections using standard javascript apis. 

#### Why is it better?

That is both simpler than doing an `Observable.combineLatest`, _and_ is how the premade stores work. Any code in a selector ought to be cut and pastable into the Angular upgrade.

### How to write a selector
It's pretty easy. Simply declare a function that takes a single parameter of type `IAppState`, and returns whatever you need for your controller, presumably creating that whatever from the members on the `IAppState` instance. 

Put the function into a file named `selectors.ts` and place that file in a subdirectory of `services/store`. Name the subdirectory to align it to the area of the application it is intended to be used from.

Here's an example that creates the view model needed by our license view:

```typescript
const by = selector => (e1, e2) => selector(e1) > selector(e2) ? 1 : -1;
const licenseVM = (state: IAppState) =>
   ({
      license: state.License,
      machines: state.License.machines.sort(by(m => m.unitNum)),
      modules: state.License.modules.sort(by(m => m.name))
   })
```

Using it is as simple as:

```typescript
clientDataStore.Selector(licenseVM)
    .subscribe(model => {
        vm.license = model.license;
        vm.machines = model.machines;
        vm.modules = model.modules;
    });
```

### Getting initial data and the server subscriptions
Refactoring to a selector means you've lost the initial fetch and subscription features. We don't have a great plan for that yet. The simplest thing I have found to do is just call the old `Select...` methods on `ClientDataStore` and ignore the results. Then cleanup up all the `Disposable`s from their `.subscribe()` calls in the `$destroy` method on your controller, like we do now.

### Next steps
The call to `subscribe` is pretty much always going to be boilerplate copy-right-to-left stuff. We will probably want to create ourselves a `mapStateToVm` function similar to the `mapStateToThis` function mentioned in this [article](https://codingwithjs.rocks/blog/angular-js-migration-war-story). It's whole job is to simply grab each member on our `model` and create/update a corresponding member on `vm`.
