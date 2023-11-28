
'use strict' ;

class Path_to_iterable {
  constructor( path ) {
    this.path = path ;
  }
  *[ Symbol.iterator ]() {
    yield* document.querySelectorAll( this.path ) ;
  }
}

const item_insert = sender => ( receiver, e ) => {
  const list  = [ ...document.querySelectorAll( ".list > .item" ) ] ;
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

function create_node() {
  const flagment = text_to_documet_fragment ( `
    <tr class = "item" draggable = "true">
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
  const item = flagment.querySelector( ".item" ) ;
  item.addEventListener( "dragstart", new Temporarily_enabled_event( new Path_to_iterable( ".list > .item" ), "dragenter", item_insert( item ), item, "dragend" ) ) ;
  item.querySelector( ".delete > .delete_button" ).addEventListener( "click", row_delete ) ;
  for( const input of item.querySelectorAll( ".sized_by_internal_text > .content" ) ){
    input.addEventListener( "input", update_text_box ) ;
    input.addEventListener( "keydown", press_enter_to_new_item ) ;
  }
  return flagment ;
}

function press_enter_to_new_item( e ) {
  if( e.code !== "Enter" ) return ;
  if( e.isComposing ) return ;
  const row = this.parentElement.parentElement.parentElement ;
  if( row.nextElementSibling === null ) row.after( create_node() ) ;
  row.nextElementSibling.cells[ this.parentElement.parentElement.cellIndex ].querySelector( ".sized_by_internal_text > .content" ).select() ;
}

function row_delete( e ) {
  this.parentElement.parentElement.remove() ;
}

window.onload = function () {
  document.querySelector( ".list" ).appendChild( create_node() ) ;
}
