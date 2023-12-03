
'use strict' ;

class Selector_to_iterable {
  constructor( path ) {
    this.path = path ;
  }
  *[ Symbol.iterator ]() {
    yield* document.querySelectorAll( this.path ) ;
  }
}

const item_insert = sender => ( receiver, e ) => {
  const list  = [ ...document.querySelectorAll( ".card_list > .card_data" ) ] ;
  if( list.indexOf( sender ) > list.indexOf( receiver ) ) receiver.before( sender ) ;
  else                                                    receiver.after(  sender ) ;
}

function text_to_documet_fragment( text ) {
  const ret    = new DocumentFragment() ;
  const parent = document.createElement( "template" ) ;
  parent.insertAdjacentHTML( "afterbegin", text ) ;
  ret.replaceChildren( ...parent.children ) ;
  return ret ;
}

function create_input_row() {
  const flagment = text_to_documet_fragment ( `
    <tr class = "card_data" draggable = "true">
      <td class = "delete">
        <button class = "delete_button" tabindex = "-1">Delete</button>
      </td>
      <td class = "name">
        <div class = "sized_by_internal_text">
          <div   class = "text_box"></div>
          <input class = "content" type = "text" ></input>
        </div>
      </td>
      <td class = "number">
        <div class = "sized_by_internal_text">
          <div   class = "text_box"></div>
          <input class = "content" type = "number" value = "1"></input>
        </div>
      </td>
    </tr>
  ` ) ;
  const row = flagment.querySelector( ".card_data" ) ;
  const sort_by_drag = new Temporarily_enabled_event( new Selector_to_iterable( ".card_list > .card_data" ), "dragenter", item_insert( row ), row, "dragend" ) ;
  const press_enter_to_number_input_field_for_next_line = new Input_to_next_target_activate( "Enter", row, ".number > .sized_by_internal_text > .content" ) ;
  const press_enter_to_name_input_field_for_next_line   = new Input_to_next_target_activate( "Enter", row, ".name   > .sized_by_internal_text > .content" ) ;
  const press_tab_to_next_line                          = new Input_to_next_target_activate( "Tab"  , row ) ;
  const event_data_list = [
    { selector: ".card_data",                                   event: "dragstart", listener: sort_by_drag },
    { selector: ".delete_button",                               event: "click",     listener: new Element_delete( row ) },
    { selector: ".sized_by_internal_text > .content",           event: "input",     listener: update_text_box },
    { selector: ".name > .sized_by_internal_text > .content",   event: "keydown",   listener: press_enter_to_name_input_field_for_next_line },
    { selector: ".number > .sized_by_internal_text > .content", event: "keydown",   listener: press_enter_to_number_input_field_for_next_line },
    { selector: "td:has( :enabled ):last-of-type",              event: "keydown",   listener: press_tab_to_next_line },
  ] ;
  for( const event_data of event_data_list )
    for( const target of flagment.querySelectorAll( event_data.selector ) )
      target.addEventListener( event_data.event, event_data.listener ) ;
  return flagment ;
}

class Input_to_next_target_activate {
  constructor( key, row, next_target_selector = "" ){
    this.key      = key ;
    this.row      = row ;
    this.selector = next_target_selector ;
  }
  handleEvent( e ) {
    if( e.code !== this.key ) return ;
    if( e.isComposing ) return ;
    if( this.row.nextElementSibling === null ) this.row.after( create_input_row() ) ;
    if( this.selector !== "" ) this.row.nextElementSibling.querySelector( this.selector ).select() ;
  }
}

class Element_delete {
  constructor( delete_target ) {
    this.target = delete_target ;
  }
  handleEvent( e ) {
    this.target.remove() ;
  }
}

function create_entered_rows( names, numbers ) {
  const ret = new DocumentFragment() ;
  const input_data_list = [
    { selector:   ".name > .sized_by_internal_text > .content", values:   names },
    { selector: ".number > .sized_by_internal_text > .content", values: numbers },
  ] ;
  const limit = Math.max( ...input_data_list.map( v => v.values.length ) ) ;
  for( let i = 0 ; i < limit ; i++ ) {
    const row = create_input_row() ;
    for( const input_data of input_data_list ) {
      for( const node of row.querySelectorAll( input_data.selector ) ) {
        node.value = input_data.values[ i ] ?? "" ;
        node.dispatchEvent( new InputEvent( "input" ) ) ;
      }
    }
    ret.append( row ) ;
  }
  return ret ;
}

class Table_output {
  constructor( string64 ) {
    this.string64 = string64 ;
  }
  handleEvent( e ) {
    const name   = this.string64.encode( [ ...document.querySelectorAll( ".name   > .sized_by_internal_text > .content" ) ].map( v => v.value ).join( "\n" ) ) ;
    const number = this.string64.encode( [ ...document.querySelectorAll( ".number > .sized_by_internal_text > .content" ) ].map( v => v.value ).join( "\n" ) ) ;
    history.pushState( {}, "", "?" + ( new URLSearchParams( { name: name, number: number } ) ) ) ;
  }
}

window.onload = function () {
  const query    = new URLSearchParams( location.search ) ;
  const string64 = new String64() ;
  const name     = query.get( "name"   ) ;
  const number   = query.get( "number" ) ;
  document.querySelector( ".card_list" ).appendChild( create_entered_rows( name === null ? "" : string64.decode( name ).split( "\n" ) , number === null ? "1" : string64.decode( number ).split( "\n" ) ) ) ;
  document.querySelector( "button.table_output" ).addEventListener( "click", new Table_output( string64 ) ) ;
}
