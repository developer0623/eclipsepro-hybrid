## Our `PUT`/`DELETE` Rx Data Pattern

The pattern works like this. We have existing classic http GET apis for getting objects and
lists of objects. We also have the server notifying us of updates and deletions of objects
in realtime via signalr. 

The signalr hub for this is called `ClientDataHub`. It receives two kinds of messages, `ObjectPut` 
and `ObjectDelete`. Those each come with a `Collection` member which really defines the 
type of object update received. A `ObjectPut` also gets a complete copy of the new or updated
object. `ObjectDelete` gets only the id. `ClientDataHub` converts these messages to `Action`s
and dispatches them to the `Store`.
