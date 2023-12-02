
"use strict";

class String64 {
  static #init( init_obj ) {
    return {
      charset: init_obj.charset ?? "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_",
      log_all: init_obj.log_all ?? ( new Array( 56 ) ).fill( 0 ),
      log_hi:  init_obj.log_hi  ?? ( new Array( 56 ) ).fill( 0 ),
    } ;
  }

  static encode ( str, init_obj = {} ) {
    let   ret = "" ;
    const { charset, log_all, log_hi } = this.#init( init_obj ) ;
    for( const v of str ) {
      const n         = v.codePointAt() ;
      const index_all = log_all.indexOf( n ) ;
      const index_hi  = log_hi.indexOf( n & 0x1fff00 ) ;
      ret +=
        index_all !== -1                 ? charset[ index_all ]
      : n >> 8    === log_all[ 0 ] >> 8  ? charset[ 0x38 | n & 3 ] + charset[ 0x3f & n >> 2 ]
      : index_hi  !== -1                 ? charset[ 0x3c | n & 3 ] + charset[ 0x3f & n >> 2 ] + charset[ index_hi ]
      : n >> 16   === log_all[ 0 ] >> 16 ? charset[ 0x3c | n & 3 ] + charset[ 0x3f & n >> 2 ] + charset[ 0x38 | n >> 8 & 3 ] + charset[ 0x3f & n >> 10 ]
      :                                    charset[ 0x3c | n & 3 ] + charset[ 0x3f & n >> 2 ] + charset[ 0x3c | n >> 8 & 3 ] + charset[ 0x3f & n >> 10 ] + charset[ n >> 16 ] ;
      for( let i = ( index_hi + 1 || log_hi.length ) - 1 ; i > 0 ; i-- ) log_hi[ i ] = log_hi[ i - 1 ] ;
      log_hi[ 0 ] = n & 0x1fff00 ;
      for( let i = ( index_all + 1 || log_all.length ) - 1 ; i > 0 ; i-- ) log_all[ i ] = log_all[ i - 1 ] ;
      log_all[ 0 ] = n ;
    }
    return ret ;
  }

  static decode ( str, init_obj = {} ) {
    let   ret = "" ;
    const { charset, log_all, log_hi } = this.#init( init_obj ) ;
    const codelist = [] ;
    for( const char of str ) codelist.push( charset.indexOf( char ) ) ;
    for( let i = 0 ; i < str.length ; ) {
      const n =
        codelist[ i ]     & 0x38 ^ 0x38 ? log_all[ codelist[ i++ ] ]
      : codelist[ i ]     & 0x3c ^ 0x3c ? codelist[ i++ ] & 3 | codelist[ i++ ] << 2 | log_hi[ 0 ]
      : codelist[ i + 2 ] & 0x38 ^ 0x38 ? codelist[ i++ ] & 3 | codelist[ i++ ] << 2 | log_hi[ codelist[ i++ ] ]
      : codelist[ i + 2 ] & 0x3c ^ 0x3c ? codelist[ i++ ] & 3 | codelist[ i++ ] << 2 | ( codelist[ i++ ] & 3 ) << 8 | codelist[ i++ ] << 10 | log_hi[ 0 ] & 0x1f0000
      :                                   codelist[ i++ ] & 3 | codelist[ i++ ] << 2 | ( codelist[ i++ ] & 3 ) << 8 | codelist[ i++ ] << 10 | codelist[ i++ ] << 16 ;
      for( let j = ( log_hi.indexOf( n & 0x1fff00 ) + 1 || log_hi.length ) - 1 ; j > 0 ; j-- ) log_hi[ j ] = log_hi[ j - 1 ] ;
      log_hi[ 0 ] = n & 0x1fff00 ;
      for( let j = ( log_all.indexOf( n ) + 1 || log_all.length ) - 1 ; j > 0 ; j-- ) log_all[ j ] = log_all[ j - 1 ] ;
      log_all[ 0 ] = n ;
      ret += String.fromCodePoint( n ) ;
    }
    return ret ;
  }
}
