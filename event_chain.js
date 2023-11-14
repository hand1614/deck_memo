
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
  constructor( sender, reciever_path, trigger, recieved_action, cancel ) {
    this.sender          = sender  ;
    this.reciever_path   = reciever_path ;
    this.trigger         = trigger ;
    this.recieved_action = recieved_action ;
    this.cancel          = cancel  ;
  }
  handleEvent ( e ) {
    for( const target of document.querySelectorAll( this.reciever_path ) ) {
      const catcher = new Sender( this.sender, target, this.recieved_action ) ;
      target.addEventListener( this.trigger, catcher ) ;
      this.sender.addEventListener( this.cancel, new Deleter( target, this.trigger, catcher ) ) ;
    }
  }
}
