
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

class Element_communicator {
  constructor( target, callback ) {
    this.target   = target ;
    this.callback = callback ;
  }
  handleEvent( e ){ this.callback( this.target, e ) ; }
}

class Event_temporarily_enabled {
  constructor( elements, enable_event_type, listener, disabler, disable_trigger ) {
    this.elements           = elements ;
    this.enable_event_type  = enable_event_type ;
    this.listener           = listener ;
    this.disabler           = disabler  ;
    this.disable_trigger    = disable_trigger ;
  }
  handleEvent ( e ) {
    for( const target of this.elements ) {
      const target_element_communicator = new Element_communicator( target, this.listener ) ;
      target.addEventListener( this.enable_event_type, event_target_communicator ) ;
      this.disabler.addEventListener( this.disable_trigger, new Deleter( target, this.listener, target_element_communicator ) ) ;
    }
  }
}

