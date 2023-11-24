
'use strict' ;

class Deleter {
  constructor( target, event_type, listener ) {
    this.target     = target ;
    this.listener   = listener ;
    this.event_type = event_type ;
  }
  handleEvent( e ) {
    this.target.removeEventListener( this.event_type, this.listener ) ;
    e.currentTarget.removeEventListener( e.type, this ) ;
  }
}

class Sender {
  constructor( sender, receiver, callback ) {
    this.sender   = sender ;
    this.receiver = receiver ;
    this.callback = callback ;
  }
  handleEvent( e ){ this.callback( this.sender, this.receiver ) ; }
}

class Event_chain {
  constructor( sender, reciever_elements, recieve_trigger, recieved_action, canceler, cancel_trigger ) {
    this.sender            = sender  ;
    this.reciever_elements = reciever_elements ;
    this.recieve_trigger   = recieve_trigger ;
    this.recieved_action   = recieved_action ;
    this.canceler          = canceler  ;
    this.cancel_trigger    = cancel_trigger ;
  }
  handleEvent ( e ) {
    for( const target of this.reciever_elements ) {
      const catcher = new Sender( this.sender, target, this.recieved_action ) ;
      target.addEventListener( this.recieve_trigger, catcher ) ;
      this.canceler.addEventListener( this.cancel_trigger, new Deleter( target, this.recieve_trigger, catcher ) ) ;
    }
  }
}

class Path_to_iterable {
  constructor( path ) {
    this.path = path ;
  }
  *[ Symbol.iterator ]() {
    yield* document.querySelectorAll( this.path ) ;
  }
}
