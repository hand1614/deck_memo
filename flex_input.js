
"usestrict" ;

function textarea_resize () {
  this.parentElement.querySelector( ".dummy" ).textContent = `${ this.value }\u200b` ;
}
