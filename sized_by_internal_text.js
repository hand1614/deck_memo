
"usestrict" ;

function update_text_box () {
  this.parentElement.querySelector( ".text_box" ).textContent = `${ this.value }\u200b` ;
}
